import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// SECURITY: Do NOT hard-code the service-role key here.
// It bypasses RLS and grants full DB/Auth admin access.
// Set SUPABASE_SERVICE_ROLE_KEY in .env.local (and in your host's env vars).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Phone+OTP customers add an email address during signup (or later on their
// profile page) via the client-side supabase.auth.updateUser({ email }).
// Supabase treats that as an *email change* and, depending on the project's
// "Confirm email change" Auth setting, only actually attaches the new email
// to the account after the user clicks a confirmation link — the account
// stays phone-only until then. Most customers never see or click that email,
// so the address never attaches to their login identity, and
// signInWithPassword({ email, password }) has nothing to match against —
// it fails with "Invalid email/mobile number or password" even though the
// password is completely correct.
//
// This route uses the service-role Admin API (server-only, never exposed to
// the browser) to attach + auto-confirm the email immediately, so
// email+password login works on the very first try after signup or after
// saving it on the profile page.
export async function POST(req: Request) {
  try {
    const { id, email } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing user id or email' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.warn('[Confirm Signup Email] Missing Supabase env vars — skipping');
      return NextResponse.json({ success: true, skipped: true });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      email_confirm: true,
    });

    if (error) {
      console.error('[Confirm Signup Email] Error attaching email:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Confirm Signup Email] Email attached + confirmed for user:', id);
    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Confirm Signup Email] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
