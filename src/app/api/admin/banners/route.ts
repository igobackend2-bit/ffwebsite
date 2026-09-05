import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: Admin > Banners' "Publish Banner" / activate /
// delete actions were writing straight to `banners` from the browser
// (supabase.from('banners').insert/update/delete(...)). The page tried to
// work around RLS with a "Silent Session Healer" that re-authenticated as
// admin@famersfactory.com using a HARDCODED password baked into the
// client bundle — a real security problem (anyone can read that password
// out of the shipped JS) — and it still failed with "Session expired.
// Please log in to the admin panel again." whenever that hardcoded
// password no longer matched the real admin password (e.g. after it was
// changed from Admin > Settings). The actual failure was never a real
// expired login session — it's the same RLS/profiles.role issue already
// fixed for orders, customers, settings, and account requests. Routing
// these writes through the service-role key here removes both the
// hardcoded-credential hack and the RLS failure.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// POST /api/admin/banners — create a banner. Body: banner fields (no id).
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const body = await req.json();
    const { data, error } = await supabase.from('banners').insert([body]).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ banner: data?.[0] || null });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/banners — update a banner. Body: { id, ...fields }.
export async function PUT(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { id, ...fields } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // .select().single() so an id that doesn't actually match any row (e.g.
    // a banner already deleted elsewhere) reports a real "not found" error
    // instead of a false success with nothing actually changed — same
    // .select() fix already applied to every other admin write in this
    // project (orders, customers, products, etc.).
    const { error } = await supabase.from('banners').update(fields).eq('id', id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/banners?id=... — delete a banner.
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

    const { error } = await supabase.from('banners').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
