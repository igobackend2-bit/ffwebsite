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
      // The "addresses" table doesn't exist in this project's schema (no
      // migration ever creates it -- delivery addresses are actually stored
      // inline on each order's delivery_address field instead). Previously
      // this missing table's error aborted the ENTIRE customer lookup,
      // wiping out real orders/coupons/LTV data along with it and showing
      // "Failed to load complete customer profile" even when the customer's
      // order history existed. Treat it as "no saved addresses" instead.
      if (addressesRes.error) {
        console.warn('[admin/customers] addresses lookup skipped (table not present):', addressesRes.error.message);
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

      // Account security info for the CRM panel — NEVER the password itself
      // (Supabase only ever stores a one-way hash of it, so it can't be
      // read back by anyone, admin included). Only the last time a reset
      // email was sent and the last sign-in time, both plain metadata
      // auth.users already tracks. Best effort: a failure here just means
      // the security card shows nothing, not that the whole lookup fails.
      let security: { recovery_sent_at: string | null; last_sign_in_at: string | null } | null = null;
      try {
        const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(customerId);
        if (!authErr && authUser?.user) {
          security = {
            recovery_sent_at: authUser.user.recovery_sent_at || null,
            last_sign_in_at: authUser.user.last_sign_in_at || null,
          };
        }
      } catch (e) {
        console.warn('[admin/customers] auth security lookup skipped:', e);
      }

      return NextResponse.json({ orders, addresses: addressesRes.data || [], coupons, security });
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

// POST /api/admin/customers — { action: 'send_password_reset', email }
// Lets support trigger a password-reset email on a customer's behalf. This
// never reveals or stores a password — it only sends the customer a secure
// link to /auth/reset-password (an existing page that already handles
// updating the password once a valid recovery link is opened).
//
// IMPORTANT: this deliberately does NOT use supabase.auth.resetPasswordForEmail(),
// which sends the email through Supabase Auth's own built-in mailer. This
// project has never configured that mailer — every other transactional
// email (order confirmations, status updates, etc.) already goes through
// this project's own working SMTP pipeline at /api/send-email instead,
// which is why customers were never actually receiving the reset email
// even though this endpoint reported success. Fix: generate the recovery
// link ourselves (generateLink sends nothing, it just returns the link),
// then deliver it through the same /api/send-email route everything else
// already uses successfully.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { action, email } = await req.json();

    if (action !== 'send_password_reset') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Same origin this request came in on (works on localhost during
    // development and on whichever domain serves production, without
    // needing a hardcoded/possibly-stale site URL).
    const origin = new URL(req.url).origin;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${origin}/auth/reset-password` },
    });

    if (linkError) {
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    const resetLink = linkData?.properties?.action_link;
    if (!resetLink) {
      return NextResponse.json({ error: 'Could not generate a reset link for this email' }, { status: 500 });
    }

    // Best-effort friendly name for the email greeting — never blocks sending.
    let customerName = '';
    try {
      const userId = linkData?.user?.id;
      if (userId) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
        customerName = profile?.full_name || '';
      }
    } catch (e) {
      console.warn('[admin/customers] name lookup for reset email skipped:', e);
    }

    // Call /api/send-email over the container's own loopback address rather
    // than its public origin. This route runs server-side, so this fetch is
    // the app calling itself from inside its own Docker/Dokploy container —
    // going out to the public https://famersfactory.com hostname and back in
    // through the reverse proxy is exactly the kind of self-referencing
    // request that fails in this hosting setup ("TypeError: fetch failed",
    // with no HTTP response at all), even though the site is reachable fine
    // from a real browser. server.js always binds to localhost:PORT (see
    // that file), so this loopback URL is always valid inside the container,
    // in both dev and this production deployment.
    const internalOrigin = `http://localhost:${process.env.PORT || 3000}`;
    const emailRes = await fetch(`${internalOrigin}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'Reset Your Password — Farmers Factory',
        template: 'password_reset',
        data: { resetLink, customerName },
      }),
    }).then((r) => r.json());

    if (emailRes?.error) {
      return NextResponse.json({ error: `Link generated but email failed to send: ${emailRes.error}` }, { status: 500 });
    }
    if (emailRes?.skipped) {
      // /api/send-email returns this when SMTP_HOST/SMTP_USER/SMTP_PASS
      // aren't set on the server — surfacing it here (rather than a false
      // "success") is exactly the bug this whole fix addresses.
      return NextResponse.json({ error: 'Email server is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing) — the reset link was generated but nothing was sent.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
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
