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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Failed to parse Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTables() {
  const { data, error } = await supabase
    .from('instructor_applications')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('instructor_applications table check failed:', error.message);
  } else {
    console.log('instructor_applications table exists! Rows found:', data.length);
  }

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error listing buckets:', bucketError);
  } else {
    console.log('Existing buckets:', buckets.map(b => b.id));
  }
}

checkTables();
