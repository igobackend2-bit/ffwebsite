const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qwiumswrbddwmlraktvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTc1MiwiZXhwIjoyMDk1NzAxNzUyfQ.9MBa2APApHe1pKgHqjCbhdK-lAobYrPGoFlMoRdCFiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDemoCustomers() {
  console.log('Fetching profiles...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles', error);
    return;
  }
  
  const adminEmail = 'admin@famersfactory.com';
  const profilesToDelete = profiles.filter(p => p.email !== adminEmail && p.role !== 'admin');
  
  console.log(`Found ${profilesToDelete.length} demo/test profiles to delete.`);
  
  for (const profile of profilesToDelete) {
    console.log(`Deleting profile ${profile.email || profile.id}`);
    await supabase.from('profiles').delete().eq('id', profile.id);
    
    // Attempt to delete user via admin api if possible (we are using service role key, so auth.admin works)
    const { error: userError } = await supabase.auth.admin.deleteUser(profile.id);
    if (userError) {
      console.log(`Could not delete auth user ${profile.id}:`, userError.message);
    }
  }
  
  console.log('Demo customers cleared.');
}

clearDemoCustomers();
