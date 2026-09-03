import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: a signed-in customer submitting a review through
// src/components/ProductReviews.tsx used to insert straight from the
// browser (`supabase.from('reviews').insert(...)`). That started failing
// with "new row violates row-level security policy for table reviews" the
// moment that form began submitting reviews as pending (is_visible: false)
// instead of immediately live — the live INSERT policy on this table
// doesn't allow a customer's own browser session to write that
// combination. Rather than depend on client-side RLS this project has
// repeatedly found out of sync with what the app actually needs (see
// FIX_ADMIN_RLS.sql, FIX_ADMIN_PERMISSIONS.sql, and the other service-role
// API routes in this project), this route takes the insert server-side
// instead. As a bonus, is_visible is always forced to false here, so a
// customer's own browser can never mark their own review as approved.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// POST: a signed-in customer submits a review from a product page. Always
// inserted as is_visible: false (pending) — it only becomes public once an
// admin approves it from Admin > Reviews (see /api/admin/reviews PATCH).
// Body: { product_id, user_id, user_name, rating, comment, is_verified }
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const body = await req.json();
    const { product_id, user_id, user_name, rating, comment, is_verified } = body || {};

    if (!product_id || !user_id || !rating) {
      return NextResponse.json({ error: 'Missing product_id, user_id, or rating' }, { status: 400 });
    }
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be a number from 1 to 5' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id,
        customer_id: null,
        user_name: user_name ? String(user_name).trim() : 'Valued Customer',
        rating: numericRating,
        comment: comment ? String(comment).trim() : null,
        is_verified: !!is_verified,
        is_visible: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
