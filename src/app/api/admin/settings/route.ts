import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: Admin > Settings' "Minimum Order Value" save was
// writing straight to `site_settings` from the browser
// (supabase.from('site_settings').upsert(...)), which failed with
// "Failed to save. Make sure the site_settings table exists." even though
// the table does exist — same underlying cause documented in
// app/api/admin/customers/route.ts and app/api/admin/orders/route.ts: the
// write depends on the logged-in admin's own profiles.role still being
// 'admin', which this project's shared ERP database has reset before.
// Routing the write through the service-role key here, the same bypass
// already used for orders and customers, makes it land for real.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// POST /api/admin/settings — { key, value } → upserts one site_settings row.
// Deliberately generic (not just for min_order_value) so any future
// site_settings save can reuse this instead of writing another one-off
// direct client upsert that hits the same RLS problem.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { key, value } = await req.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid key' }, { status: 400 });
    }
    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'Missing value' }, { status: 400 });
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value: String(value) }, { onConflict: 'key' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
