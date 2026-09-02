import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: a customer's "Delete My Account" request needs to
// reliably reach admin. Writing it with a direct client-side insert would
// hit the same silent-failure pattern documented in every other write in
// this app (app/api/admin/orders, /settings, /notifications/mark-read) —
// an insert blocked by RLS affects 0 rows with no error, so the request
// would look like it went through but never actually show up for admin.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// GET /api/account/request-deletion?user_id=... — does this customer
// already have a pending deletion request? Lets the profile page show
// "Request Pending" instead of the button again after they've asked once.
export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      // Table probably doesn't exist yet (migration not run) — treat as
      // "no pending request" instead of breaking the profile page.
      return NextResponse.json({ pending: false });
    }

    return NextResponse.json({ pending: !!data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/account/request-deletion — { user_id, email, full_name, reason }
// Files a "please delete my account" request for admin to review. This does
// NOT delete anything by itself — only admin approving it from
// /admin/account-requests (see /api/admin/account-requests) actually
// removes the account.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { user_id, email, full_name, reason } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Don't file a second request if one is already pending.
    const { data: existing } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadyPending: true });
    }

    const { error } = await supabase
      .from('account_deletion_requests')
      .insert({ user_id, email, full_name, reason: reason || null, status: 'pending' });

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: "This feature isn't set up yet. Please contact support directly to close your account." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
