import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrpqiclpsggvcdtlkued.supabase.co';
const supabaseKey = 'sb_publishable_brQ6uPbcdO7b56gGRN0v6w_uY2yHK-f';

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, track, category');
  
  if (error) {
    console.error("Error fetching courses:", error);
    return;
  }
  
  console.log("Courses in DB:");
  console.log(JSON.stringify(courses, null, 2));

  const { data: profiles, error2 } = await supabase
    .from('profiles')
    .select('id, full_name, track, learning_track, role');
  
  if (error2) {
    console.error("Error fetching profiles:", error2);
  } else {
    console.log("Profiles in DB:");
    console.log(JSON.stringify(profiles, null, 2));
  }
}

run();
