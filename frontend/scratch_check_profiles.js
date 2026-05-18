import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.resolve(__dirname, './.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVal = (key) => {
  const match = envContent.match(new RegExp(`${key}\\s*=\\s*([^\\n\\r]+)`));
  return match ? match[1].trim().replace(/['"]/g, '') : null;
};

const supabaseUrl = getEnvVal('VITE_SUPABASE_URL');
const supabaseKey = getEnvVal('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Failed to parse Supabase URL or Anon Key from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Querying profiles...');
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log(`Found ${data.length} profiles:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkProfiles();
