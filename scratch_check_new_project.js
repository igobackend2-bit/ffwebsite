const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qwiumswrbddwmlraktvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTc1MiwiZXhwIjoyMDk1NzAxNzUyfQ.9MBa2APApHe1pKgHqjCbhdK-lAobYrPGoFlMoRdCFiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProject() {
  console.log('Checking Auth Users...');
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) console.error('Auth Error:', userError.message);
  else console.log('Users found:', users.users.map(u => u.email));

  console.log('Checking site_settings table...');
  const { data: settings, error: settingsError } = await supabase.from('site_settings').select('*').limit(1);
  if (settingsError) console.error('Table Error:', settingsError.message);
  else console.log('Table site_settings exists.');
}

checkProject();
