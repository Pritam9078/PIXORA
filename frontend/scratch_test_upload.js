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

// Create anon client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  // A tiny valid 1x1 transparent PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const buffer = Buffer.from(pngBase64, 'base64');
  const filePath = `avatars/test-image-${Date.now()}.png`;
  
  console.log(`Attempting anonymous upload of ${filePath}...`);
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true
    });
    
  if (error) {
    console.error('Upload failed:', error);
  } else {
    console.log('Upload successful! File details:', data);
  }
}

testUpload();
