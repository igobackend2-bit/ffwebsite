import { NextResponse } from 'next/server';
import { createCashfreeOrder, getCashfreeConfig } from '@/lib/cashfree';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

// Called from the checkout page right after the order row + order_items are
// already saved in Supabase (same as the existing COD flow). This just asks
// Cashfree for a payment session for that order's total, so the browser can
// redirect the customer to Cashfree's hosted UPI/card/netbanking checkout.
export async function POST(req: Request) {
  try {
    const { orderId, amount, customerId, customerName, customerPhone, customerEmail } = await req.json();

    if (!orderId || !amount || !customerId) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const returnUrl = `${SITE_URL}/checkout/payment-callback?order_id=${encodeURIComponent(orderId)}`;
    const sanitizedPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10) || '9999999999';

    const cfOrder = await createCashfreeOrder({
      orderId,
      amount,
      customerId,
      customerName: customerName || 'Customer',
      customerPhone: sanitizedPhone,
      customerEmail,
      returnUrl,
    });

    const { isProduction } = getCashfreeConfig();

    return NextResponse.json({
      success: true,
      paymentSessionId: cfOrder.payment_session_id,
      cfOrderId: cfOrder.order_id,
      mode: isProduction ? 'production' : 'sandbox',
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Cashfree] Create order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment order' }, { status: 500 });
  }
}
