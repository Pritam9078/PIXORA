-- Add missing columns to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Ensure RLS is active and permissive for instructors
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Instructors can update their own courses') THEN
        CREATE POLICY "Instructors can update their own courses" ON public.courses
            FOR UPDATE USING (auth.uid() = instructor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Instructors can delete their own courses') THEN
        CREATE POLICY "Instructors can delete their own courses" ON public.courses
            FOR DELETE USING (auth.uid() = instructor_id);
    END IF;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
