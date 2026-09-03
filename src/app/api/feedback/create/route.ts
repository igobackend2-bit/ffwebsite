import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// POST /api/feedback/create
//
// Creates the post-delivery feedback request row + sends the survey email,
// server-side with the service-role key.
//
// Why this route exists: the feedback row insert used to happen directly
// from the browser in src/lib/feedback.ts, via
// supabase.from('feedback').insert(...) using the logged-in admin's session.
// That's exactly the same RLS/profiles.role cause documented across every
// other admin write this project needed a service-role route for (see
// app/api/admin/orders/route.ts, app/api/notifications/create/route.ts) —
// the feedback_admin_insert policy on public.feedback requires
// public.ff_is_admin() to pass for a direct client insert, and whenever the
// admin's session doesn't satisfy that, the insert is silently blocked. The
// order status update itself still succeeds and the "Order marked as
// DELIVERED" toast still shows, so nothing looked broken — the customer
// just never got the survey email. app/api/feedback/backfill/route.ts
// already used the correct service-role pattern as a one-off catch-up job;
// this route brings the same fix to the live per-order trigger in
// src/lib/feedback.ts so every future delivery is covered automatically,
// not just the historical backfill.
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export async function POST(req: Request) {
  try {
    const { order_id, order_number, customer_name, customer_email } = await req.json();

    if (!customer_email) {
      console.warn('[Feedback] Skipped — no customer email on file for order', order_id);
      return NextResponse.json({ success: false, error: 'No customer email on file' });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn('[Feedback] Missing Supabase service-role env vars — skipping');
      return NextResponse.json({ success: false, error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const token = crypto.randomUUID();
    const orderNumber = order_number || String(order_id || '').slice(0, 8);
    const customerName = customer_name || 'Valued Customer';

    const { error: insertError } = await supabase.from('feedback').insert({
      order_id: order_id || null,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email,
      token,
      status: 'pending',
    });

    if (insertError) {
      console.error('[Feedback] Failed to create request:', insertError.message);
      return NextResponse.json({ success: false, error: insertError.message });
    }

    try {
      const res = await fetch(`${SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer_email,
          subject: `How was your delivery? #${orderNumber} — Farmers Factory`,
          template: 'feedback_request',
          data: { orderNumber, customerName, token },
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!result.success && !result.skipped) {
        console.warn('[Feedback] Email send did not succeed:', result.error);
      }
    } catch (emailError) {
      // The feedback row still exists even if the email failed to send —
      // don't let an email hiccup fail the whole request.
      console.error('[Feedback] Email send failed:', emailError);
    }

    console.log('[Feedback] Request created for order:', order_id);
    return NextResponse.json({ success: true, token });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Feedback] Unexpected error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
