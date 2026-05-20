import { createClient } from '@supabase/supabase-js';
import { VERIFIED_INVENTORY } from './constants';

// SECURITY: keys are loaded from environment variables only.
// Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
// and in your hosting provider (Vercel -> Settings -> Environment Variables).
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

if (typeof window === 'undefined' && (supabaseUrl === PLACEHOLDER_URL || supabaseAnonKey === PLACEHOLDER_KEY)) {
  // Log only on the server to avoid leaking config state to the browser console
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.');
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== PLACEHOLDER_URL &&
  supabaseAnonKey !== PLACEHOLDER_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      if (!isSupabaseConfigured) {
        console.error('Supabase is not configured. Request blocked.');
        return Promise.reject(new Error('Supabase not configured'));
      }
      return fetch(...args);
    }
  }
});
