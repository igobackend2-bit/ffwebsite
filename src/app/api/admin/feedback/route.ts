import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// GET /api/admin/feedback
//
// Why this route exists: src/app/admin/feedback/page.tsx used to read
// public.feedback straight from the browser via
// supabase.from('feedback').select('*'), using the logged-in admin's own
// session. That depends on the feedback_admin_select RLS policy
// (public.ff_is_admin()) passing for that session — the exact same
// RLS/profiles.role cause documented across every other admin read in this
// project that needed a service-role route instead (see
// app/api/admin/orders/route.ts, app/api/admin/customers/route.ts). When it
// doesn't pass, the query returns zero rows with no error, so the page just
// shows "No feedback in this filter yet." / "Responses: 0" even though the
// customer's response is sitting in the table — confirmed via direct SQL.
// Routing the read through the service-role key here fixes it the same way
// every other admin page in this project was fixed.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rows: data || [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
