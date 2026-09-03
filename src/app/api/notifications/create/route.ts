import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Service-role key bypasses Row Level Security — server-side only.
//
// Why this route exists: order notifications were being inserted straight
// into `notifications` from the browser —
// checkout/page.tsx on placing a new order, and admin/orders/page.tsx on a
// status change (confirmed/processing/packed/shipped/delivered/cancelled/
// rejected/pending) or an order-total edit — via
// supabase.from('notifications').insert(...). Both call sites only
// console.warn on failure and never surface it to anyone, so the insert
// silently failing looked like everything worked (order placed fine,
// status saved fine) while the customer's notification bell never received
// it and its red unread count never moved. Same RLS/profiles.role cause
// documented across every other admin write this project needed a
// service-role route for (see app/api/admin/orders/route.ts,
// app/api/admin/settings/route.ts, etc.) — it turns out it was silently
// blocking this customer-facing insert too. Routing every notification
// creation through this one shared route fixes all of them at once.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// POST /api/notifications/create
// Body: { user_id, title, message, type, link? } — inserts one notification
// row (is_read always starts false). Deliberately generic — any future
// "notify this customer" call site should reuse this instead of writing
// another one-off direct client insert that hits the same RLS wall.
export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Server is missing Supabase service-role configuration' }, { status: 500 });
    }

    const { user_id, title, message, type, link } = await req.json();
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }
    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Missing title, message, or type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id, title, message, type, link: link || null, is_read: false })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
