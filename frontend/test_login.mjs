import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mrpqiclpsggvcdtlkued.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_brQ6uPbcdO7b56gGRN0v6w_uY2yHK-f";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const credentials = [
  { email: "dpritam08@gmail.com", role: "student" },
  { email: "kurakesh199812@gmail.com", role: "instructor" },
  { email: "dpritam2708@gmail.com", role: "super_admin" }
];

async function run() {
  console.log("=== TESTING SIGN IN ===");
  for (const cred of credentials) {
    console.log(`\nAttempting sign in for ${cred.role} (${cred.email})...`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: "testpassword123"
    });

    if (error) {
      console.error(`Sign in FAILED:`, error.message, `(Status: ${error.status})`);
      console.error(JSON.stringify(error, null, 2));
    } else {
      console.log(`Sign in SUCCESSFUL!`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`Email: ${data.user.email}`);
      console.log(`Role: ${data.user.user_metadata?.role}`);
    }
  }
}

run();
