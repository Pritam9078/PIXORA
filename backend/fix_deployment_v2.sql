-- ====================================================================
-- PIXORA DEPLOYMENT FIX (V3) - FINAL RECONCILIATION
-- Run this in your Supabase SQL Editor (https://app.supabase.com/)
-- ====================================================================

-- 1. FIX COURSES TABLE (Added missing metadata)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. FIX LESSONS TABLE (Crucial for publishing)
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT;

-- 3. FIX ENROLLMENTS TABLE (Crucial for Dashboard charts)
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    UNIQUE(student_id, course_id)
);

-- Ensure created_at exists (if table was created with enrolled_at previously)
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. STORAGE BUCKET INITIALIZATION
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'course-assets');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-assets' AND auth.role() = 'authenticated');

-- 5. RELOAD SCHEMA CACHE (CRITICAL)
NOTIFY pgrst, 'reload schema';

-- 6. VERIFICATION
SELECT 'Success' as status, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') as has_description,
       (SELECT count(*) FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'created_at') as has_created_at;
