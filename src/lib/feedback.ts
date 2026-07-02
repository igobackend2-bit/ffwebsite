import { supabase } from './supabase';

// ============================================================================
// Customer Feedback System helpers.
//
// createFeedbackRequest() is called once, right when an order is marked
// DELIVERED (see src/app/admin/orders/page.tsx, handleStatusChange). It:
//   1. Inserts a 'pending' row into public.feedback with a random token.
//   2. Sends the feedback_request email containing a link the customer can
//      open with no login: /feedback/{token}.
//
// The customer-facing form itself never talks to Supabase directly — it
// goes through /api/feedback/[token] and /api/feedback/submit, which use
// the service role key server-side (same pattern as api/send-email). This
// insert here, however, runs in the already-authenticated admin session,
// which is allowed by the feedback_admin_insert RLS policy
// (see ADD_CUSTOMER_FEEDBACK_SYSTEM.sql).
// ============================================================================

export interface FeedbackOrderInput {
  id: string;
  order_number?: string;
  customer?: {
    email?: string;
    full_name?: string;
  };
}

export async function createFeedbackRequest(order: FeedbackOrderInput) {
  const email = order.customer?.email;
  if (!email) {
    console.warn('[Feedback] Skipped — no customer email on file for order', order.id);
    return { success: false, error: 'No customer email on file' };
  }

  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const orderNumber = order.order_number || String(order.id).slice(0, 8);
  const customerName = order.customer?.full_name || 'Valued Customer';

  const { error: insertError } = await supabase.from('feedback').insert({
    order_id: order.id,
    order_number: orderNumber,
    customer_name: customerName,
    customer_email: email,
    token,
    status: 'pending',
  });

  if (insertError) {
    console.error('[Feedback] Failed to create request:', insertError.message);
    return { success: false, error: insertError.message };
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `How was your delivery? #${orderNumber} — Farmers Factory`,
        template: 'feedback_request',
        data: { orderNumber, customerName, token },
      }),
    });
    const result = await res.json();
    if (!result.success && !result.skipped) {
      console.warn('[Feedback] Email send did not succeed:', result.error);
    }
  } catch (emailError) {
    // The feedback row still exists even if the email failed to send —
    // don't let an email hiccup block the order status update.
    console.error('[Feedback] Email send failed:', emailError);
  }

  return { success: true, token };
}
