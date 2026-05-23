import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Read .env file manually instead of dotenv if it's missing
const env = fs.readFileSync('.env', 'utf-8');
let NEXT_PUBLIC_SUPABASE_URL = '';
let NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
env.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) NEXT_PUBLIC_SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) NEXT_PUBLIC_SUPABASE_ANON_KEY = line.split('=')[1].trim();
});

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@famersfactory.com',
    password: 'AdminPassword123!'
  });
  
  if (authError) {
    console.error("Login Error:", authError);
    return;
  }
  
  console.log("Logged in UID:", authData.user.id);
  
  // Try inserting a banner
  console.log("Inserting banner...");
  const { data, error } = await supabase.from('banners').insert([{
    title: 'Test Banner',
    subtitle: 'Test',
    image_url: 'https://example.com/image.png',
    link: '/',
    display_order: 1,
    is_active: false
  }]).select();
  
  if (error) {
    console.error("Insert Error:", error);
  } else {
    console.log("Insert Success:", data);
    // Cleanup
    await supabase.from('banners').delete().eq('id', data[0].id);
  }
}
run();
