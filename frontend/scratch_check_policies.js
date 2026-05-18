import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read backend .env manually for service role key
const envPath = path.resolve(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}\\s*=\\s*([^\\n\\r]+)`));
  return match ? match[1].trim().replace(/['"]/g, '') : null;
};

const supabaseUrl = getEnvVal('SUPABASE_URL');
const serviceRoleKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Failed to parse Supabase URL or Service Role Key from backend/.env');
  process.exit(1);
}

// Pass storage schema in options
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'storage' }
});

async function checkPolicies() {
  console.log('Querying storage.policies...');
  const { data, error } = await supabase
    .from('policies')
    .select('*');
    
  if (error) {
    console.error('Error querying storage.policies:', error);
  } else {
    console.log('Found policies:', data);
  }
}

checkPolicies();
