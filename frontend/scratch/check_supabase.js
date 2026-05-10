
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const instructorId = 'e9a1e4ae-96d3-4565-9544-43d14b6b4d1b';
  
  console.log('Checking for instructor:', instructorId);
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', instructorId).single();
  console.log('Profile:', profile);

  const { data: courses } = await supabase.from('courses').select('*').eq('instructor_id', instructorId);
  console.log('Courses count:', courses?.length || 0);
  if (courses?.length > 0) {
    console.log('Course IDs:', courses.map(c => c.id));
    const courseIds = courses.map(c => c.id);
    const { data: enrollments, count } = await supabase.from('enrollments').select('*', { count: 'exact' }).in('course_id', courseIds);
    console.log('Enrollments count:', count || 0);
    console.log('Enrollments:', enrollments);
    
    if (enrollments?.length > 0) {
      const studentIds = enrollments.map(e => e.student_id);
      const { data: studentProfiles } = await supabase.from('profiles').select('*').in('id', studentIds);
      console.log('Student Profiles count:', studentProfiles?.length || 0);
      console.log('Student Profiles:', studentProfiles);
    }
  } else {
    console.log('No courses found for this instructor.');
  }
}

checkData();
