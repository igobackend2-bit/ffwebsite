import { createClient } from '@supabase/supabase-js';
import { VERIFIED_INVENTORY } from './constants';

// Correct project: celsdwfmogpejwzbkxad (matches .env.local and SUPABASE_SERVICE_ROLE_KEY)
const DEFAULT_SUPABASE_URL = 'https://celsdwfmogpejwzbkxad.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTQ2ODYsImV4cCI6MjA5MzE5MDY4Nn0.wxFKTG3MwtfICKcs_cK5w9qrAYKMqbKweFBEXv5aVwM';

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
  },
  global: {
    fetch: (...args) => {
      return fetch(...args);
    }
  }
});
