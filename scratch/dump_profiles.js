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

async function dumpProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, xp_points, learning_track');
  
  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

dumpProfiles();
