import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: the "Delete Review" button on Admin > Reviews
// previously deleted straight from the browser (`supabase.from('reviews')
// .delete().eq('id', id)`). The DELETE policy on `reviews` only allows a
// row's own author to delete it (`auth.uid() = user_id`); admin access
// relies on a separate `is_admin()`-based policy that this project's own
// SQL fix files (FIX_ADMIN_RLS.sql, FIX_ADMIN_PERMISSIONS.sql) document as
// having silently broken before. When that check fails, Supabase deletes 0
// rows but reports no error, so the UI shows "Review deleted" even though
// the review is still there. Going through the service-role key here
// removes that fragile dependency entirely.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// GET: list all reviews for the admin panel, regardless of moderation
// status (pending/approved/rejected). Goes through the service-role key
// for the same reason as DELETE below — the admin panel's fake
// localStorage auth means normal client requests hit RLS as an anonymous
// user, and the public SELECT policy only returns approved reviews (plus
// a user's own), so pending/rejected reviews from other customers would
// never reach the admin screen otherwise.
export async function GET() {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name, image_urls)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: admin approve / reject / manually re-mark a review's status.
// Body: { id: string, status: 'pending' | 'approved' | 'rejected' }
export async function PATCH(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const body = await req.json();
    const { id, status } = body || {};

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data });
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

    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
