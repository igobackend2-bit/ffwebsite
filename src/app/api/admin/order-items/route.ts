import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: lib/admin.ts's getOrderDetails() was reading
// order_items directly with the plain client-side supabase client
// (.select('*, products(*)').eq('order_id', orderId)). Same root cause as
// every other broken admin read this session (see app/api/admin/orders'
// comments) — that read depends on the logged-in admin's own profiles.role
// still being 'admin' in the shared ERP database, which keeps getting
// reset, so it silently returned an empty array instead of an error. That's
// exactly why clicking an order in Admin > Orders opened the details modal
// but the "Ordered Items" section never showed what the customer actually
// placed — orderDetails.length was always 0. Going through the
// service-role key here, the same bypass already used for orders,
// customers, settings and stats, makes it return the real rows.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// GET /api/admin/order-items?order_id=... — the products and quantities
// placed on one order, with each product's name/image/unit joined in.
export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');
    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const { data: items, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
