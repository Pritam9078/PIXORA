const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking courses table columns...');
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching courses:', error.message);
  } else {
    console.log('Columns found in courses:', data.length > 0 ? Object.keys(data[0]) : 'No data, but table exists');
  }
}

checkSchema();
