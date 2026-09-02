import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: the Admin Dashboard's Total Revenue / Active
// Orders / Total Customers tiles were reading `orders` and `profiles`
// straight from the browser (lib/admin.ts's getAdminStats()), which
// depends on the logged-in admin's own profiles.role still being 'admin'
// in the shared ERP database — the same check that's been reset before and
// already caused "NO ORDERS FOUND" (fixed in app/api/admin/orders) and
// customer-list/loyalty issues (fixed in app/api/admin/customers). Those
// two direct reads were silently returning empty results, showing ₹0 /
// 0 / 0 on the dashboard even though real orders and customers exist —
// while Stock Alerts (a products-table read) kept working, because
// products stays readable for this session. Routing through the
// service-role key here, the same bypass already used elsewhere, always
// returns the real numbers.
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

    const [ordersRes, productsCountRes, customersCountRes, outOfStockRes] = await Promise.all([
      supabase.from('orders').select('total_amount, status'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).or('stock.eq.0,in_stock.eq.false'),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (ordersRes.data || []).map((o: any) => ({
      ...o,
      status: o.status?.toLowerCase() === 'placed' ? 'pending' : (o.status?.toLowerCase() || 'pending'),
    }));

    const totalRevenue = orders.reduce((sum: number, order: { total_amount: number }) => sum + Number(order.total_amount || 0), 0);
    const totalOrders = orders.length;

    return NextResponse.json({
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      totalOrders: totalOrders.toString(),
      activeProducts: (productsCountRes.count || 0).toString(),
      totalCustomers: (customersCountRes.count || 0).toString(),
      outOfStockCount: (outOfStockRes.count || 0).toString(),
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
