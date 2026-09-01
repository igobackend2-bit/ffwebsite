const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dotenv dependency needed)
function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const envPath = process.argv[2];
const env = loadEnv(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.log(JSON.stringify({ ok: false, reason: 'missing url/serviceKey', hasUrl: !!url, hasKey: !!serviceKey }));
  process.exit(0);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, serviceKey);

(async () => {
  const result = { ok: true };

  // 1) Does site_settings exist and what's in it?
  const { data: settingsRow, error: settingsErr } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'admin_password')
    .maybeSingle();
  result.site_settings_error = settingsErr ? settingsErr.message : null;
  result.site_settings_row = settingsRow || null;

  // 2) Does the profiles table have an admin, and does auth have admin@famersfactory.com?
  const { data: adminProfiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('role', 'admin');
  result.profiles_error = profErr ? profErr.message : null;
  result.admin_profile_count = adminProfiles ? adminProfiles.length : null;

  // 3) Check auth.users for admin@famersfactory.com via admin API
  try {
    const { data: usersPage, error: usersErr } = await supabase.auth.admin.listUsers();
    result.auth_list_error = usersErr ? usersErr.message : null;
    const match = (usersPage?.users || []).find(u => u.email === 'admin@famersfactory.com');
    result.auth_admin_user_exists = !!match;
    result.auth_admin_user_id = match ? match.id : null;
  } catch (e) {
    result.auth_list_error = String(e.message || e);
  }

  console.log(JSON.stringify(result, null, 2));
})();
