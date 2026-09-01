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
          email: prof?.email || usr?.email || '',
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
