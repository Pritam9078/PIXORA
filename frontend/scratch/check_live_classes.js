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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLiveClasses() {
  console.log('Querying live_classes...');
  const { data, error } = await supabase
    .from('live_classes')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching live_classes:', error);
  } else {
    console.log('Successfully fetched live_classes.');
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
      console.log('Sample Row:', data[0]);
    } else {
      console.log('Table is empty. Let\'s try to select specific columns to check if they exist.');
      // Attempting to select duration_minutes to see if it exists
      const { error: colErr } = await supabase
        .from('live_classes')
        .select('duration_minutes')
        .limit(1);
      if (colErr) {
        console.error('duration_minutes select error:', colErr.message);
      } else {
        console.log('duration_minutes column exists!');
      }
    }
  }
}

checkLiveClasses();
