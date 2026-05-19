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
  console.error('Failed to parse Supabase URL or Service Role Key from backend .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function updateCourses() {
  console.log('Updating courses in DB...');

  // Update "web 3" course to BLOCKCHAIN
  const { data: data1, error: error1 } = await supabase
    .from('courses')
    .update({ track: 'BLOCKCHAIN' })
    .eq('id', '9efb0194-8dc4-41c2-9947-e5ccdebb4998')
    .select();

  if (error1) {
    console.error('Error updating web 3 course:', error1);
  } else {
    console.log('Updated web 3 course:', data1);
  }

  // Update "game dev" course to GAME_DEV
  const { data: data2, error: error2 } = await supabase
    .from('courses')
    .update({ track: 'GAME_DEV' })
    .eq('id', 'f60aafb6-d871-4100-9a42-f63bc311ece3')
    .select();

  if (error2) {
    console.error('Error updating game dev course:', error2);
  } else {
    console.log('Updated game dev course:', data2);
  }
}

updateCourses();
