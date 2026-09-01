import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: the Admin > Notifications page needs to (a) list
// every broadcast ever sent (not just the ones targeted at whichever admin
// happens to be logged in) and (b) insert a new broadcast on behalf of
// "the store", not a specific authenticated customer. Both of those need to
// bypass the `notifications` table's normal RLS policies (which scope reads
// to "your own notifications or an untargeted/all broadcast" for the
// customer-facing bell in Navbar.tsx) — the same reasoning documented in
// app/api/admin/customers/route.ts.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// GET /api/admin/notifications — the admin's own sent-broadcast log.
// Only returns admin-composed messages (type = 'promo' | 'info'), not every
// row in the table — order-status updates, etc. use other `type` values and
// belong to the customer-facing bell only, not this admin log.
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('type', ['promo', 'info'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // The `notifications` table already ships in supabase_schema.sql, so
      // this should never be "table does not exist" in practice — but if a
      // deployment is missing it, fail soft with an empty log instead of a
      // 500 that would block the whole admin page from rendering.
      if (error.message?.includes('does not exist')) {
        return NextResponse.json({ notifications: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Resolve target customer names for "sent to one person" rows so the
    // admin log can show "Sent to Asha Menon" instead of a bare UUID. Best
    // effort only — if this lookup fails for any reason, the log still
    // renders (just without a friendly name) rather than erroring out.
    const targetIds = Array.from(
      new Set((data || []).map((n) => n.user_id).filter(Boolean))
    );
    let profileNames: Record<string, string> = {};
    if (targetIds.length > 0) {
      try {
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', targetIds);
        if (profileErr) {
          console.warn('[admin/notifications] profile name lookup skipped:', profileErr.message);
        } else {
          profileNames = Object.fromEntries(
            (profiles || []).map((p) => [p.id, p.full_name || p.email || p.phone || 'Customer'])
          );
        }
      } catch (e) {
        console.warn('[admin/notifications] profile name lookup skipped:', e);
      }
    }

    const notifications = (data || []).map((n) => ({
      ...n,
      target_name: n.user_id ? (profileNames[n.user_id] || 'Customer') : null,
    }));

    return NextResponse.json({ notifications });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/notifications — send a broadcast.
// Body: { type: 'promo' | 'info', title: string, message: string,
//          target: 'all' | 'user', userId?: string }
// target 'all' reaches every logged-in customer's bell (user_id left null,
// exactly what the existing Navbar.tsx bell already treats as "everyone");
// target 'user' reaches only the one specified customer.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const body = await req.json();
    const { type, title, message, target, userId } = body || {};

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }
    if (type !== 'promo' && type !== 'info') {
      return NextResponse.json({ error: 'type must be "promo" or "info"' }, { status: 400 });
    }
    if (target !== 'all' && target !== 'user') {
      return NextResponse.json({ error: 'target must be "all" or "user"' }, { status: 400 });
    }
    if (target === 'user' && !userId) {
      return NextResponse.json({ error: 'userId is required when target is "user"' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: target === 'user' ? userId : null,
        title,
        message,
        type,
        is_read: false,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
