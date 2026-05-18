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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAndCreateBuckets() {
  console.log('Listing storage buckets with service_role...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error listing buckets:', error);
  } else {
    console.log('Available buckets:', buckets);
    
    const avatarsBucketExists = buckets.some(b => b.id === 'avatars');
    if (!avatarsBucketExists) {
      console.log('avatars bucket does not exist. Creating it...');
      const { data, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
        fileSizeLimit: 2 * 1024 * 1024 // 2MB
      });
      
      if (createError) {
        console.error('Failed to create avatars bucket:', createError);
      } else {
        console.log('Successfully created avatars bucket:', data);
      }
    } else {
      console.log('avatars bucket already exists.');
    }
  }
}

checkAndCreateBuckets();
