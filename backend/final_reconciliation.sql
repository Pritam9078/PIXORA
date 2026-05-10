-- ====================================================================
-- FINAL SCHEMA RECONCILIATION & FIXES
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- 1. Fix Enrollments Table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES auth.users(id); 
-- Note: If student_id already exists and references profiles, that's fine.

-- 2. Fix Quiz Attempts Relationship
-- Ensure the foreign key exists and is named correctly for PostgREST
ALTER TABLE public.quiz_attempts 
DROP CONSTRAINT IF EXISTS quiz_attempts_quiz_id_fkey,
ADD CONSTRAINT quiz_attempts_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

-- 3. RLS Policies for Students (Curriculum Access)
-- Modules Access
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrolled students can read modules" ON public.modules;
CREATE POLICY "Enrolled students can read modules" ON public.modules
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = modules.course_id AND student_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND instructor_id = auth.uid())
);

-- Lessons Access
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrolled students can read lessons" ON public.lessons;
CREATE POLICY "Enrolled students can read lessons" ON public.lessons
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.enrollments e ON e.course_id = m.course_id
        WHERE m.id = lessons.module_id AND e.student_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = lessons.module_id AND c.instructor_id = auth.uid()
    )
);

-- 4. Course Visibility Fix
-- Ensure students can see public courses or their own college's courses
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone" ON public.courses
FOR SELECT USING (true);

-- 5. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
