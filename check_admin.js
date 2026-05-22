const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNDY4NiwiZXhwIjoyMDkzMTkwNjg2fQ.pyNKC2Sq5_6oy7I7aG0jfo4jzueND1UghG6Xiw0Fn4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const adminUser = users.users.find(u => u.email === 'admin@farmersfactory.com');
  
  if (!adminUser) {
    console.error('Admin user not found in auth.users!');
    return;
  }
  
  console.log('Admin Auth User ID:', adminUser.id);
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', adminUser.id)
    .single();
    
  console.log('Admin Profile:', profile);
}

checkAdmin();
