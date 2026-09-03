// ============================================================================
// Customer Feedback System helpers.
//
// createFeedbackRequest() is called once, right when an order is marked
// DELIVERED (see src/app/admin/orders/page.tsx, handleStatusChange). It
// posts to /api/feedback/create, which — using the service-role key,
// server-side — inserts a 'pending' row into public.feedback with a random
// token and sends the feedback_request email containing a link the customer
// can open with no login: /feedback/{token}.
//
// This used to insert directly from the browser via
// supabase.from('feedback').insert(...), using the logged-in admin's
// session. That's the same RLS/profiles.role cause documented across every
// other admin write this project needed a service-role route for (see
// app/api/admin/orders/route.ts, app/api/notifications/create/route.ts): the
// feedback_admin_insert policy requires public.ff_is_admin() to pass, and
// whenever the admin's session didn't satisfy that, the insert was silently
// blocked — the order status update itself still succeeded, so nothing
// looked broken, but the customer never got the survey email. Routing it
// through /api/feedback/create fixes it the same way every other admin
// write in this project was fixed.
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

  const orderNumber = order.order_number || String(order.id).slice(0, 8);
  const customerName = order.customer?.full_name || 'Valued Customer';

  try {
    const res = await fetch('/api/feedback/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: email,
      }),
    });
    const result = await res.json();
    if (!result.success) {
      console.error('[Feedback] Failed to create request:', result.error);
    }
    return result;
  } catch (err) {
    // The order status update already succeeded — don't let an email/API
    // hiccup surface as a failure on the status change itself.
    console.error('[Feedback] Request failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Request failed' };
  }
}
