import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { fetchCashfreeOrder } from '@/lib/cashfree';

// SECURITY: Service-role key bypasses RLS — server-side only. Needed here
// because payment confirmation has to work for any customer's order, not
// just whoever happens to be logged into the browser making the request.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// Called by the /checkout/payment-callback page after Cashfree redirects the
// customer back. We NEVER trust that redirect alone — we re-check the real
// payment status directly with Cashfree's server here before marking
// anything as paid, exactly like the plan discussed with the client.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id'); // our order_number, e.g. FF-123456

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const cfOrder = await fetchCashfreeOrder(orderId);
    const isPaid = cfOrder.order_status === 'PAID';

    if (isPaid && order.payment_status !== 'PAID') {
      await supabase.from('orders').update({ payment_status: 'PAID' }).eq('id', order.id);

      // Fire the same "order confirmed" notification + email that COD orders
      // already get right after placing — for online payments these only go
      // out once the payment is actually confirmed, not before.
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Order Confirmed! 🌿',
        message: `Your order #${order.order_number} has been successfully placed and is being prepared.`,
        type: 'order_status',
        link: `/profile?tab=orders&order=${order.order_number}`,
        is_read: false,
      });

      try {
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', order.user_id).single();
        if (profile?.email) {
          await fetch(`${SITE_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: profile.email,
              subject: `Order Confirmed ✅ #${order.order_number} — Farmers Factory`,
              template: 'order_confirmation',
              data: {
                orderId: order.id,
                orderNumber: order.order_number,
                total: order.total,
                date: new Date().toLocaleDateString('en-IN'),
              },
            }),
          });
        }
      } catch (emailErr) {
        console.warn('[Cashfree] Order confirmation email failed:', emailErr);
      }
    } else if (!isPaid && order.payment_status !== 'PAID') {
      // Still processing (ACTIVE) or genuinely failed/expired — record best-known state.
      const nextStatus = cfOrder.order_status === 'ACTIVE' ? 'PENDING' : 'FAILED';
      if (order.payment_status !== nextStatus) {
        await supabase.from('orders').update({ payment_status: nextStatus }).eq('id', order.id);
      }
    }

    return NextResponse.json({
      success: true,
      isPaid,
      status: cfOrder.order_status,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Cashfree] Verify payment error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
