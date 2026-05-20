import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your URL or use react-native-dotenv
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Key

if (supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn('Mobile Supabase URL is not set! Please update src/lib/supabase.ts');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
