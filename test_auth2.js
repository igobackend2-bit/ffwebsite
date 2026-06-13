const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTQ2ODYsImV4cCI6MjA5MzE5MDY4Nn0.wxFKTG3MwtfICKcs_cK5w9qrAYKMqbKweFBEXv5aVwM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@farmersfactory.com',
    password: 'AdminPassword123!'
  });
  if (error) console.error('Error:', error.message);
  else console.log('Success:', data.user.id);
}
testAuth();
