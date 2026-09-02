import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: same reason as every other admin write/read this
// session (orders, customers, settings, stats, notify-restock) — the
// admin's own browser session can't reliably read or write here under this
// project's RLS setup, so both listing requests and actually deleting an
// account go through the service-role key instead.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// GET /api/admin/account-requests — list pending "delete my account" requests.
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      // Table probably doesn't exist yet (ADD_ACCOUNT_DELETION_REQUESTS.sql
      // not run) — show an empty list instead of breaking the admin page.
      console.warn('[account-requests] Skipped (table not available):', error.message);
      return NextResponse.json({ requests: [] });
    }

    return NextResponse.json({ requests: data || [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/account-requests — { id, action: 'approve' | 'reject' }
//
// 'approve' PERMANENTLY deletes the customer's login (auth.users row).
// Every table that references it already does so with ON DELETE CASCADE
// (profiles, cart, orders, wishlist, user_addresses, notifications,
// stock_notifications, reviews) so their entire account — profile, order
// history, cart, wishlist, saved addresses, notifications — is removed
// with it. This cannot be undone.
//
// 'reject' just dismisses the request and leaves the account untouched.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { id, action } = await req.json();
    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing or invalid id/action' }, { status: 400 });
    }

    const { data: requestRow, error: fetchError } = await supabase
      .from('account_deletion_requests')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !requestRow) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('account_deletion_requests')
        .delete()
        .eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'rejected' });
    }

    // action === 'approve' — actually delete the account.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(requestRow.user_id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // The request row cascades away with the auth user too, but clean it
    // up explicitly in case it somehow outlived the cascade.
    await supabase.from('account_deletion_requests').delete().eq('id', id);

    return NextResponse.json({ success: true, action: 'approved' });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
