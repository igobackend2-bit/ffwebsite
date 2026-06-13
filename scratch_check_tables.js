const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qwiumswrbddwmlraktvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTc1MiwiZXhwIjoyMDk1NzAxNzUyfQ.9MBa2APApHe1pKgHqjCbhdK-lAobYrPGoFlMoRdCFiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTables() {
  const { data, error } = await supabase.rpc('get_tables_info'); // if rpc exists
  // if not, try fetching from some known tables
  const knownTables = ['profiles', 'users', 'products', 'orders', 'site_settings', 'admin_users'];
  for (const table of knownTables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (!error) console.log(`Table ${table} exists.`);
    else console.log(`Table ${table} error: ${error.message}`);
  }
}

getTables();
