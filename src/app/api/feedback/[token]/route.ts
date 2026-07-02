import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// GET /api/feedback/[token]
//
// Looks up a feedback request by its one-time token, using the service role
// key (same pattern as src/app/api/send-email/route.ts's getSupabaseAdmin()).
// The public.feedback table has NO anon-facing RLS policy at all — this
// route is the only way the customer-facing form ever touches that table,
// so the anon key can never be used to list or scan other customers' rows.
// ============================================================================

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('feedback')
    .select('order_number, customer_name, status, created_at')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'This feedback link is invalid.' }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: data.order_number,
    customerName: data.customer_name,
    status: data.status,
    createdAt: data.created_at,
  });
}
