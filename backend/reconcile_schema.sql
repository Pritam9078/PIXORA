-- ====================================================================
-- SCHEMA RECONCILIATION FOR INSTRUCTOR ECOSYSTEM
-- Run this in your Supabase SQL Editor to fix 400 errors
-- ====================================================================

-- 1. Ensure Courses Table has all required columns
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id);

-- 2. Ensure Enrollments Table matches the Phase 2 schema but remains flexible
-- If enrolled_at doesn't exist, create it.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enrollments' AND column_name='enrolled_at') THEN
        ALTER TABLE public.enrollments ADD COLUMN enrolled_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 3. Lessons Table Alignment
-- Add course_id to lessons for optimized counting and flat querying
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- 4. Quizzes Table Alignment
-- The frontend expects certain fields. Let's ensure basic ones exist.
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 20;

-- 5. RLS Policy Fixes
-- Ensure instructors can insert their own courses
DROP POLICY IF EXISTS "Instructors can insert courses" ON public.courses;
CREATE POLICY "Instructors can insert courses" ON public.courses
FOR INSERT WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors manage own courses" ON public.courses;
CREATE POLICY "Instructors manage own courses" ON public.courses
FOR ALL USING (auth.uid() = instructor_id);

-- Ensure profiles are visible to authenticated users (needed for seeding/fetching student profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- 6. Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. RELOAD SCHEMA CACHE
-- This is CRITICAL for PostgREST to recognize the new columns
NOTIFY pgrst, 'reload schema';
