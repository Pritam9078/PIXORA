const { createClient } = require('../frontend/node_modules/@supabase/supabase-js');
const dotenv = require('../frontend/node_modules/dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = ['profiles', 'colleges', 'courses', 'platform_settings', 'audit_logs', 'support_tickets'];

async function checkAll() {
  for (const table of tables) {
    try {
      console.log(`\n--- Checking table: ${table} ---`);
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
