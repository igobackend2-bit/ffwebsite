const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://celsdwfmogpejwzbkxad.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTQ2ODYsImV4cCI6MjA5MzE5MDY4Nn0.wxFKTG3MwtfICKcs_cK5w9qrAYKMqbKweFBEXv5aVwM'
);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@farmersfactory.com',
    password: 'AdminPassword123!'
  });
  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  console.log('Logged in as:', authData.session.user.id);

  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles Query Error:', pError);
  console.log('Profiles count:', profiles ? profiles.length : 0);

  const { data: banners, error: bError } = await supabase.from('banners').insert([{ title: 'test', media_url: 'test' }]);
  console.log('Banners Insert Error:', bError);
}

run();
