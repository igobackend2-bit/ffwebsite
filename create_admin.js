const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://celsdwfmogpejwzbkxad.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlbHNkd2Ztb2dwZWp3emJreGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNDY4NiwiZXhwIjoyMDkzMTkwNjg2fQ.pyNKC2Sq5_6oy7I7aG0jfo4jzueND1UghG6Xiw0Fn4c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  console.log('Creating admin user...');
  
  // 1. Create the user in auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@famersfactory.com',
    password: 'AdminPassword123!',
    email_confirm: true
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
      console.log('User already exists, continuing to profile setup...');
    } else {
      console.error('Failed to create user:', authError);
      return;
    }
  }

  // Get the user ID (either newly created or existing)
  const { data: users } = await supabase.auth.admin.listUsers();
  const adminUser = users.users.find(u => u.email === 'admin@famersfactory.com');
  
  if (!adminUser) {
    console.error('Could not find admin user after creation attempt.');
    return;
  }

  const userId = adminUser.id;
  console.log('Admin User ID:', userId);

  // 2. Upsert profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      role: 'admin',
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Failed to create/update profile:', profileError);
  } else {
    console.log('SUCCESS! Admin user created and profile role set to admin.');
  }
}

setupAdmin();
