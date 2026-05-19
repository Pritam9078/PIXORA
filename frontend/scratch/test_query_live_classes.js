import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = './.env';
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
} catch (e) {
  console.error('Failed to read .env file:', e.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testing select * on live_classes...');
  const { data, error } = await supabase
    .from('live_classes')
    .select('*');

  if (error) {
    console.error('Select error:', error);
  } else {
    console.log('Select successful. Rows returned:', data.length);
    console.log(data);
  }
}

testQuery();
