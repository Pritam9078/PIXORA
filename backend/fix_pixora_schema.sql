-- ====================================================================
-- PIXORA SCHEMA RECONCILIATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX 400/403 ERRORS
-- ====================================================================

-- 1. FIX PROFILES TABLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS learning_track TEXT DEFAULT 'agnostic',
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_coding_hours FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. FIX ENROLLMENTS RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
CREATE POLICY "Students can view own enrollments" ON public.enrollments 
FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 3. FIX COURSES RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses 
FOR SELECT USING (status = 'published' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 4. FIX AUDIT LOGS (ACTIVITY FEED) RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view activity feed" ON public.audit_logs;
CREATE POLICY "Everyone can view activity feed" ON public.audit_logs 
FOR SELECT USING (true);

-- 5. FIX ASSIGNMENTS RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view assignments for enrolled courses" ON public.assignments;
CREATE POLICY "Students can view assignments for enrolled courses" ON public.assignments 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid()) 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 6. FIX QUIZZES RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students can view quizzes for enrolled courses" ON public.quizzes;
CREATE POLICY "Students can view quizzes for enrolled courses" ON public.quizzes 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = quizzes.course_id AND student_id = auth.uid()) 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);
