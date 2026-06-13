const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNDY4NiwiZXhwIjoyMDkzMTkwNjg2fQ.pyNKC2Sq5_6oy7I7aG0jfo4jzueND1UghG6Xiw0Fn4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) console.error(error);
  else {
    const admins = data.users.filter(u => u.email.includes('admin'));
    console.log('Admins found:', admins.map(u => u.email));
  }
}

checkUsers();
