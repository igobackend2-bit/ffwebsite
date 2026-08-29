/**
 * Cashfree Payment Gateway helper — SERVER-SIDE ONLY.
 *
 * Reads CASHFREE_ENV ("TEST" or "PRODUCTION") to decide which key pair and
 * API base URL to use, so switching from sandbox to live payments later is
 * a single environment-variable change (CASHFREE_ENV=PRODUCTION) — no code
 * change needed. Never import this file into a 'use client' component; the
 * secret key must never reach the browser.
 */

const CASHFREE_API_VERSION = '2025-01-01';

function isProductionEnv() {
  return (process.env.CASHFREE_ENV || 'TEST').toUpperCase() === 'PRODUCTION';
}

export function getCashfreeConfig() {
  const prod = isProductionEnv();
  const appId = prod ? process.env.CASHFREE_APP_ID_PROD : process.env.CASHFREE_APP_ID_TEST;
  const secretKey = prod ? process.env.CASHFREE_SECRET_KEY_PROD : process.env.CASHFREE_SECRET_KEY_TEST;
  const baseUrl = prod ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

  return { appId, secretKey, baseUrl, isProduction: prod };
}

function cashfreeHeaders(secretKey: string, appId: string) {
  return {
    'Content-Type': 'application/json',
    'x-api-version': CASHFREE_API_VERSION,
    'x-client-id': appId,
    'x-client-secret': secretKey,
  };
}

export interface CreateCashfreeOrderParams {
  orderId: string; // our own order_number (e.g. FF-123456) — reused as Cashfree's order_id too
  amount: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl: string;
}

export async function createCashfreeOrder(params: CreateCashfreeOrderParams) {
  const { appId, secretKey, baseUrl } = getCashfreeConfig();
  if (!appId || !secretKey) {
    throw new Error('Cashfree API keys are not configured on the server');
  }

  const res = await fetch(`${baseUrl}/orders`, {
    method: 'POST',
    headers: cashfreeHeaders(secretKey, appId),
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: params.customerId,
        customer_name: params.customerName,
        customer_phone: params.customerPhone,
        customer_email: params.customerEmail || undefined,
      },
      order_meta: {
        return_url: params.returnUrl,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to create Cashfree order');
  }
  return data as { order_id: string; payment_session_id: string; [key: string]: unknown };
}

export async function fetchCashfreeOrder(orderId: string) {
  const { appId, secretKey, baseUrl } = getCashfreeConfig();
  if (!appId || !secretKey) {
    throw new Error('Cashfree API keys are not configured on the server');
  }

  const res = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: cashfreeHeaders(secretKey, appId),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to fetch Cashfree order status');
  }
  return data as { order_status: string; [key: string]: unknown };
}
