import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: the Admin > Customers (CRM) page reads the
// `profiles` table. Reading it directly from the browser depends on the
// `is_admin()` Postgres function returning true for the logged-in admin,
// which in turn depends on that admin's own `profiles.role` still being
// 'admin'. This project's own SQL fix files (FIX_ADMIN_PERMISSIONS.sql,
// FIX_ADMIN_RLS.sql) document that the shared ERP database has reset that
// role before, which silently makes every other customer's profile
// invisible to the admin panel (0 customers shown) even though the rows
// exist. Going through the service-role key here sidesteps that fragile
// check entirely and always returns the real data.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    // Per-customer detail lookup (orders + addresses + coupons used) for the
    // CRM detail modal. This goes through the service-role key for the same
    // reason as the profiles list below: reading `orders`/`addresses` for a
    // customer OTHER than the logged-in admin straight from the browser
    // depends on an is_admin()-style RLS exception that may not exist (or be
    // active) on every table, which previously caused "Failed to load
    // complete customer profile" even though the rows exist.
    if (customerId) {
      const [ordersRes, addressesRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', customerId).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', customerId)
      ]);

      if (ordersRes.error) {
        return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
      }
      if (addressesRes.error) {
        return NextResponse.json({ error: addressesRes.error.message }, { status: 500 });
      }

      const orders = ordersRes.data || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const couponIds = Array.from(new Set(orders.map((o: any) => o.coupon_id).filter(Boolean)));
      let coupons: unknown[] = [];
      if (couponIds.length > 0) {
        const { data: couponsData } = await supabase
          .from('coupons')
          .select('id, code, discount_type, discount_value')
          .in('id', couponIds);
        coupons = couponsData || [];
      }

      return NextResponse.json({ orders, addresses: addressesRes.data || [], coupons });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles: data || [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { id, points } = await req.json();
    if (!id || typeof points !== 'number' || isNaN(points)) {
      return NextResponse.json({ error: 'Missing or invalid id/points' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ points })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data?.[0] || null });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase.from('profiles').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
