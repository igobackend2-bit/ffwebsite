import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: "Notify Me" lets a customer ask to hear when a
// sold-out product is back. Fanning that out into real in-app
// notifications for every customer who asked needs to write a
// `notifications` row per customer and mark their `stock_notifications`
// request as done — writing to another customer's notifications from the
// admin's own browser session is exactly the kind of write that's been
// silently failing all day under RLS (see app/api/admin/orders,
// /customers, /settings, /stats). Doing it here with the service-role key
// makes it land for real, and keeps the fan-out logic in one place instead
// of duplicating it in every admin page that can restock a product
// (Products page toggle + bulk action, Inventory page stock editor).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// POST /api/admin/notify-restock — { product_id }
// Call this right after a product's stock genuinely goes from 0 to
// available. Safe to call even when nobody asked to be notified, or when
// the stock_notifications table doesn't exist yet (returns a soft no-op
// rather than an error, since this is a best-effort side effect of
// restocking, not something that should block the stock update itself).
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }

    // Claim the pending rows FIRST (atomically), then send. Restocking a
    // product can trigger this route more than once for the same event —
    // e.g. an admin double-clicking Save, or toggling stock from both the
    // Products page and the Inventory page in quick succession — and the
    // old code read the pending rows, sent notifications, and only THEN
    // marked them notified_at. That left a window where a second call could
    // read the same still-NULL rows before the first call's update landed,
    // sending the same "back in stock" notification twice. A single
    // UPDATE ... WHERE notified_at IS NULL ... RETURNING is atomic per row
    // in Postgres, so if this route runs twice at once each pending row is
    // claimed by exactly one of the calls — no more duplicate sends.
    const { data: claimed, error: claimError } = await supabase
      .from('stock_notifications')
      .update({ notified_at: new Date().toISOString() })
      .eq('product_id', product_id)
      .is('notified_at', null)
      .select('user_id');

    if (claimError) {
      // Table probably doesn't exist yet (ADD_STOCK_NOTIFICATIONS.sql not
      // run) — this is a best-effort feature, so don't fail the restock.
      console.warn('[notify-restock] Skipped (stock_notifications not available):', claimError.message);
      return NextResponse.json({ success: true, notified: 0, skipped: true });
    }

    if (!claimed || claimed.length === 0) {
      return NextResponse.json({ success: true, notified: 0 });
    }

    const { data: product } = await supabase
      .from('products')
      .select('name, category')
      .eq('id', product_id)
      .single();

    const productName = product?.name || 'An item on your wishlist';
    const link = product?.category ? `/${slugify(product.category)}/${slugify(product.name)}` : '/products';

    const rows = claimed.map((p: { user_id: string }) => ({
      user_id: p.user_id,
      title: `🌱 Back in Stock — ${productName}`,
      message: `Good news! ${productName} is back in stock. Grab it before it sells out again.`,
      type: 'restock',
      link,
      is_read: false,
    }));

    const { error: insertError } = await supabase.from('notifications').insert(rows);
    if (insertError) {
      // We already claimed these rows above — since sending failed, release
      // the claim so a future restock still notifies these customers
      // instead of silently skipping them forever.
      await supabase
        .from('stock_notifications')
        .update({ notified_at: null })
        .in('user_id', claimed.map((p: { user_id: string }) => p.user_id))
        .eq('product_id', product_id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notified: rows.length });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
