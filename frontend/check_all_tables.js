import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually to avoid extra dependencies
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

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = ['profiles', 'colleges', 'courses', 'platform_settings', 'audit_logs', 'support_tickets'];

async function checkAll() {
  for (const table of tables) {
    try {
      console.log(`\n--- Table: ${table} ---`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
        
      if (error) {
        console.error(`Error querying ${table}:`, error.message);
      } else {
        console.log(`Row count: ${count}`);
        if (data && data.length > 0) {
          console.log(`Columns:`, Object.keys(data[0]));
          console.log(`Sample row:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`Table is empty.`);
        }
      }
    } catch (err) {
      console.error(`Exception checking table ${table}:`, err.message);
    }
  }
}

checkAll();
