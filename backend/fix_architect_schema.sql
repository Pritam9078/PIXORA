-- ====================================================================
-- PIXORA ADVANCED ARCHITECT SCHEMA PATCH (V2)
-- Run this in your Supabase SQL Editor to fix 400 errors and missing columns
-- ====================================================================

-- 1. FIX COURSES TABLE (Adding Advanced Essentials & Metadata)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS college_id UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. FIX LESSONS TABLE (Adding Architect Details)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT;

-- 3. FIX PROFILES TABLE (Adding College Identity)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS college_id UUID,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- 4. FIX ENROLLMENTS TABLE (Ensure analytics columns exist)
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW();

-- 5. STORAGE BUCKET INITIALIZATION
-- Create course-assets bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for course-assets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'course-assets');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-assets' AND auth.role() = 'authenticated');

-- 6. ENSURE PERMISSIONS & RLS
-- Allow instructors to fully manage their courses
DROP POLICY IF EXISTS "Instructors manage own courses" ON public.courses;
CREATE POLICY "Instructors manage own courses" ON public.courses
FOR ALL USING (auth.uid() = instructor_id);

-- Ensure profiles are readable for student lookups
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
FOR SELECT USING (true);

-- 7. RELOAD SCHEMA CACHE (CRITICAL)
NOTIFY pgrst, 'reload schema';

-- Verify the columns exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('courses', 'lessons') 
AND column_name IN ('objectives', 'description', 'duration', 'thumbnail_url');
