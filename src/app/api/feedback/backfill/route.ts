import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// POST /api/feedback/backfill
//
// One-time (safe to re-run) catch-up job: sends the post-delivery feedback
// request to every customer whose order was already marked DELIVERED before
// the Customer Feedback System existed, so no past customer is missed.
//
// Uses the service role key (same pattern as /api/feedback/[token] and
// /api/send-email) so it works regardless of the admin session's RLS
// visibility — it does not touch or depend on any of the admin-panel code.
//
// Safe to call more than once: any order that already has a row in
// public.feedback is skipped, so nobody gets duplicate emails.
// ============================================================================

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://famersfactory.com';

export async function POST() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured (missing service role key)' }, { status: 500 });
  }

  // 1. Every delivered order
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, order_number, user_id, delivery_address, status')
    .ilike('status', 'delivered');

  if (ordersErr) {
    return NextResponse.json({ error: ordersErr.message }, { status: 500 });
  }
  if (!orders || orders.length === 0) {
    return NextResponse.json({ totalDelivered: 0, sent: 0, message: 'No delivered orders found.' });
  }

  // 2. Skip orders that already have a feedback request
  const orderIds = orders.map((o) => o.id);
  const { data: existing } = await supabase
    .from('feedback')
    .select('order_id')
    .in('order_id', orderIds);
  const alreadyRequested = new Set((existing || []).map((f) => f.order_id));
  const pending = orders.filter((o) => !alreadyRequested.has(o.id));

  if (pending.length === 0) {
    return NextResponse.json({
      totalDelivered: orders.length,
      alreadyHadRequest: orders.length,
      sent: 0,
      message: 'Every delivered order already has a feedback request.',
    });
  }

  // 3. Resolve customer name/email — same logic as getAllOrders() in
  //    src/lib/admin.ts, kept in sync deliberately: only real UUID user_ids
  //    are looked up (placeholder values like "phone:+91..." are skipped),
  //    with the delivery address as a name fallback for guest orders.
  const userIds = [
    ...new Set(
      pending
        .map((o) => o.user_id)
        .filter((id): id is string => typeof id === 'string' && UUID_RE.test(id))
    ),
  ];

  const [profilesRes, usersRes] = await Promise.all([
    userIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    userIds.length
      ? supabase.from('users').select('id, name, email').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; name: string | null; email: string | null }[] }),
  ]);
  const profiles = profilesRes.data || [];
  const users = usersRes.data || [];

  let sent = 0;
  let skippedNoEmail = 0;
  const failures: string[] = [];

  for (const order of pending) {
    const prof = profiles.find((p) => p.id === order.user_id);
    const usr = users.find((u) => u.id === order.user_id);
    const email = prof?.email || usr?.email || '';

    if (!email) {
      skippedNoEmail++;
      continue;
    }

    const addrLines = String(order.delivery_address || '')
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);
    const customerName = prof?.full_name || usr?.name || addrLines[0] || 'Valued Customer';
    const orderNumber = order.order_number || String(order.id).slice(0, 8);
    const token = crypto.randomUUID();

    const { error: insertErr } = await supabase.from('feedback').insert({
      order_id: order.id,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: email,
      token,
      status: 'pending',
    });

    if (insertErr) {
      failures.push(`${orderNumber}: ${insertErr.message}`);
      continue;
    }

    try {
      const res = await fetch(`${SITE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `How was your delivery? #${orderNumber} — Farmers Factory`,
          template: 'feedback_request',
          data: { orderNumber, customerName, token },
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || (!result.success && !result.skipped)) {
        failures.push(`${orderNumber}: email send did not succeed`);
        continue;
      }
      sent++;
    } catch (e) {
      failures.push(`${orderNumber}: ${e instanceof Error ? e.message : 'email request failed'}`);
    }
  }

  return NextResponse.json({
    totalDelivered: orders.length,
    alreadyHadRequest: alreadyRequested.size,
    skippedNoEmail,
    sent,
    failures,
  });
}
