const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTQ2ODYsImV4cCI6MjA5MzE5MDY4Nn0.wxFKTG3MwtfICKcs_cK5w9qrAYKMqbKweFBEXv5aVwM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@famersfactory.com',
    password: 'AdminPassword123!'
  });
  
  if (error) {
    console.error('Auth Error:', error.message);
  } else {
    console.log('Auth Success:', data.user.id);
  }
}

testAuth();
