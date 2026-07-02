import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// POST /api/feedback/submit
//
// Body: { token, rating, deliveryTags?, comment? }
//
// Validates the token, refuses to overwrite an already-submitted response
// (so the link can't be resubmitted), and writes the answer using the
// service role key — mirrors src/app/api/feedback/[token]/route.ts.
// ============================================================================

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { token, rating, deliveryTags, comment } = body || {};

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Please select a rating from 1 to 5' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const { data: existing, error: lookupError } = await supabase
    .from('feedback')
    .select('status')
    .eq('token', token)
    .single();

  if (lookupError || !existing) {
    return NextResponse.json({ error: 'This feedback link is invalid.' }, { status: 404 });
  }
  if (existing.status === 'submitted') {
    return NextResponse.json({ error: 'This feedback has already been submitted.' }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from('feedback')
    .update({
      rating: ratingNum,
      delivery_tags: Array.isArray(deliveryTags) ? deliveryTags : [],
      comment: typeof comment === 'string' ? comment.slice(0, 2000) : null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('token', token);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
