import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read backend .env manually for service role key
const envPath = path.resolve(__dirname, '../../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}\\s*=\\s*([^\\n\\r]+)`));
  return match ? match[1].trim().replace(/['"]/g, '') : null;
};

const supabaseUrl = getEnvVal('SUPABASE_URL');
const serviceRoleKey = getEnvVal('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .limit(10);
    
  if (error) {
    console.error('Error fetching applications:', error.message);
  } else {
    console.log('Applications in DB:', data);
  }
}

checkApplications();
