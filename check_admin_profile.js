import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  const adminUser = users.users.find(u => u.email === 'admin@farmersfactory.com');
  console.log("Admin User ID:", adminUser?.id);
  
  if (adminUser) {
    const { data: profile, error: err2 } = await supabase.from('profiles').select('*').eq('id', adminUser.id).single();
    console.log("Admin Profile:", profile);
    console.log("Profile Error:", err2?.message);
  }
}
run();
