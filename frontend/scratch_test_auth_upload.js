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

// Create client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedUpload() {
  console.log('Logging in as Gunanidhi Das...');
  const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'dpritam08@gmail.com',
    password: 'testpassword123'
  });
  
  if (loginError) {
    console.error('Login failed:', loginError);
    return;
  }
  
  const userId = authData.user.id;
  console.log(`Login successful! User ID: ${userId}`);
  
  // A tiny valid 1x1 transparent PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(pngBase64, 'base64');
  const filePath = `${userId}-test-auth-image-${Date.now()}.png`;
  
  console.log(`Attempting authenticated upload of ${filePath} to avatars bucket...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true
    });
    
  if (uploadError) {
    console.error('Upload failed:', uploadError);
  } else {
    console.log('Upload successful! File details:', uploadData);
  }
  
  // Logout
  await supabase.auth.signOut();
}

testAuthenticatedUpload();
