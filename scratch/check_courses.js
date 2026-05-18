import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.resolve(__dirname, '../frontend/.env');
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

async function checkCourses() {
  console.log('Querying courses...');
  const { data, error } = await supabase.from('courses').select('*');
  if (error) {
    console.error('Error fetching courses:', error);
  } else {
    console.log(`Found ${data.length} courses:`);
    data.forEach((c, idx) => {
      console.log(`\n[Course ${idx + 1}]`);
      console.log(`ID: ${c.id}`);
      console.log(`Title: ${c.title}`);
      console.log(`Category: ${c.category}`);
      console.log(`Status: ${c.status}`);
      console.log(`Price: ${c.price} (${typeof c.price})`);
      console.log(`Track: ${c.track}`);
      console.log(`Level: ${c.level}`);
    });
  }
}

checkCourses();
