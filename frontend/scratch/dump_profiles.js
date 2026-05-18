import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually
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

async function dump() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log(`\n=== Profiles in Supabase (${profiles.length} total) ===`);
    profiles.forEach((p, idx) => {
      console.log(`[${idx + 1}] ID: ${p.id} | Name: ${p.full_name} | Role: ${p.role} | Specialization: ${p.specialization} | Track: ${p.learning_track}`);
    });
  }
}

dump();
