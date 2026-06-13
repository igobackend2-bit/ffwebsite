const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNDY4NiwiZXhwIjoyMDkzMTkwNjg2fQ.pyNKC2Sq5_6oy7I7aG0jfo4jzueND1UghG6Xiw0Fn4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  const admins = users.users.filter(u => u.email.includes('admin'));
  
  for (const u of admins) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    console.log(`User: ${u.email}, ID: ${u.id}, Role: ${profile ? profile.role : 'NO PROFILE'}`);
  }
}

checkProfiles();
