import { createClient, processLock } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qwiumswrbddwmlraktvy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMjU3NTIsImV4cCI6MjA5NTcwMTc1Mn0.AsY045N7wHqMF_2P0-D2Ouzrkphjfkb4CP6ImhSm-tc';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (typeof window === 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('[Supabase] Missing env vars; using bundled public Supabase anon config.');
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Customers were seeing "Lock ... was released because another
    // request stole it" on the Verify OTP screen and getting kicked back
    // to an error instead of being signed in. That error comes from
    // supabase-js's default browser locking strategy (`navigatorLock`),
    // which coordinates auth calls across tabs using the Web Locks API —
    // an API that many mobile browsers and in-app webviews (the kind an
    // ad/WhatsApp/Instagram link opens) implement inconsistently or not
    // at all, so it can "steal" the lock from a legitimate in-flight
    // signInWithOtp()/verifyOtp() call and make it fail even though
    // nothing was actually wrong. `processLock` is Supabase's own
    // documented alternative: a plain in-memory lock that doesn't depend
    // on the browser's Web Locks implementation at all, so it can't be
    // stolen this way. This only changes how this one client
    // synchronizes its own auth calls — it doesn't touch anything else.
    lock: processLock,
  },
});
