import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: Admin > Orders was reading the `orders` table
// directly from the browser (via lib/admin.ts's getAllOrders(), using the
// plain client-side supabase client). That read depends on an is_admin()
// style RLS exception being active for the logged-in admin, which in turn
// depends on that admin's own `profiles.role` still being 'admin'. This
// project's own SQL fix files (FIX_ADMIN_PERMISSIONS.sql, FIX_ADMIN_RLS.sql)
// and app/api/admin/customers/route.ts document that the shared ERP
// database has reset that role before, which silently makes every order
// invisible to the admin panel ("NO ORDERS FOUND") even though the rows
// exist — getAllOrders() swallows the RLS error and just returns [].
// Going through the service-role key here, the same way customers already
// does, sidesteps that fragile check entirely and always returns the real
// data. This route is additive only — it does not change lib/admin.ts or
// any other existing code path.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Same enrichment lib/admin.ts's getAllOrders() does — attach a display
    // "customer" object per order, falling back to the delivery_address text
    // when a profile/user row can't be matched.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIds = [...new Set(orders.map((o: any) => o.user_id).filter((id: unknown): id is string => typeof id === 'string' && UUID_RE.test(id)))];

    const [profilesRes, usersRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('id, full_name, email, phone, avatar_url').in('id', userIds)
        : Promise.resolve({ data: [] as unknown[] }),
      userIds.length > 0
        ? supabase.from('users').select('id, name, email').in('id', userIds)
        : Promise.resolve({ data: [] as unknown[] }),
    ]);

    const profiles = profilesRes.data || [];
    const users = usersRes.data || [];

    // Fallback to the real Supabase Auth email for any customer whose
    // `profiles.email` / `users.email` came back empty. Those two tables are
    // denormalized copies that don't always get filled in at signup, but the
    // customer's actual sign-in email always lives on their auth.users row —
    // it's what checkout used to send the very first order-confirmation
    // email. Without this fallback, every *later* email this admin panel
    // triggers (a "Set Shipped"/"Set Packed" status update, or the
    // post-delivery feedback request) silently has nowhere to send to, so
    // the customer only ever sees that first confirmation email and nothing
    // after it — looking exactly like "I marked it Shipped but the email
    // still says Confirmed" / "Feedback email not sent: No customer email on
    // file".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missingEmailIds = userIds.filter((id) => {
      const prof: any = profiles.find((p: any) => p.id === id);
      const usr: any = users.find((u: any) => u.id === id);
      return !(prof?.email || usr?.email);
    });
    const authEmailById: Record<string, string> = {};
    if (missingEmailIds.length > 0) {
      await Promise.all(missingEmailIds.map(async (id) => {
        try {
          const { data } = await supabase.auth.admin.getUserById(id);
          if (data?.user?.email) authEmailById[id] = data.user.email;
        } catch {
          // Best-effort — leave this customer's email blank rather than
          // failing the whole orders list over one lookup.
        }
      }));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enriched = orders.map((order: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prof: any = profiles.find((p: any) => p.id === order.user_id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usr: any = users.find((u: any) => u.id === order.user_id);
      const addrLines = String(order.delivery_address || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const addrName = addrLines[0] || '';
      const addrPhone = addrLines[1] || '';
      const addrText = addrLines.length > 2 ? addrLines.slice(2).join(', ') : '';
      return {
        ...order,
        status: order.status?.toLowerCase() === 'placed' ? 'pending' : (order.status?.toLowerCase() || 'pending'),
        customer: {
          id: order.user_id,
          full_name: prof?.full_name || usr?.name || addrName || 'Guest Customer',
          avatar_url: prof?.avatar_url || '',
          email: prof?.email || usr?.email || authEmailById[order.user_id] || '',
          phone: prof?.phone || addrPhone || '',
          address: addrText,
        },
      };
    });

    return NextResponse.json({ orders: enriched });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/orders — { id, status? , total_amount? }
//
// Why this exists: admin/orders/page.tsx's handleStatusChange() and
// handleAmountChange() were writing straight to the `orders` table with the
// plain client-side supabase client (`.update(...).eq('id', orderId)`,
// no `.select()`). Under Postgres RLS, an UPDATE whose USING clause the
// current session fails to satisfy for a given row simply updates 0 rows —
// it is NOT reported as an error unless the caller chains `.select()`.
// This is exactly what "admin marks an order Shipped, sees a success toast,
// but the status reverts to Pending on reload" looks like: the write never
// actually landed, silently, because the logged-in admin's own
// profiles.role check (see the GET handler above and
// app/api/admin/customers/route.ts) failed for the write just like it did
// for reads before that was fixed. Routing writes through the service-role
// key here — the same bypass already used for reads — makes them land for
// real, and this handler returns the updated row so the caller can confirm
// it actually changed.
export async function PATCH(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { id, status, total_amount } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (total_amount !== undefined) {
      const n = Number(total_amount);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: 'Invalid total_amount' }, { status: 400 });
      }
      updates.total_amount = n;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update — provide status and/or total_amount' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      // With the service-role key this should never happen (it bypasses
      // RLS), but guard anyway rather than silently reporting success.
      return NextResponse.json({ error: 'Order not found or update did not apply' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
