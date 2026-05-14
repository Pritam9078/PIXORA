
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://mrpqiclpsggvcdtlkued.supabase.co';
const supabaseKey = 'sb_publishable_brQ6uPbcdO7b56gGRN0v6w_uY2yHK-f';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCourse() {
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('*, modules(*, lessons(*))')
    .ilike('title', '%web 3%');

  if (courseError) {
    console.error('Error fetching courses:', courseError);
    return;
  }

  console.log('--- Courses matching "web 3" ---');
  courses.forEach(c => {
    console.log(`ID: ${c.id}, Title: ${c.title}, Status: ${c.status}`);
    console.log(`Modules: ${c.modules.length}`);
    c.modules.forEach(m => {
      console.log(`  Module: ${m.title}, Lessons: ${m.lessons.length}`);
      m.lessons.forEach(l => {
        console.log(`    Lesson: ${l.title}, Type: ${l.content_type}, URL: ${l.content_url}`);
      });
    });
  });
}

debugCourse();
