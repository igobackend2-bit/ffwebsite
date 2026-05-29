import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Do NOT hard-code the service-role key here.
// It bypasses RLS and grants full DB admin access.
// Set SUPABASE_SERVICE_ROLE_KEY in .env.local (and in Vercel → Settings → Environment Variables).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const { id, email, name } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[Sync User] Missing Supabase env vars — skipping sync');
      return NextResponse.json({ success: true, skipped: true });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Upsert into public.users to satisfy the foreign key constraint on orders
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id,
        email: email || null,
        name: name || null,
      }, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[Sync User] Error upserting into public.users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Sync User] Successfully synced user:', id);
    return NextResponse.json({ success: true, user: data?.[0] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Sync User] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
