-- 1. Base Permissions
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 2. Courses Table Fixes
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id);

-- 3. Curriculum Tables
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content_type TEXT DEFAULT 'video',
    content_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Student Management Tables
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) NOT NULL,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) NOT NULL,
    content_url TEXT,
    grade INTEGER,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies (Security)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Instructors can manage their own courses
DROP POLICY IF EXISTS "Instructors can manage own courses" ON public.courses;
CREATE POLICY "Instructors can manage own courses" ON public.courses
FOR ALL TO authenticated USING (instructor_id = auth.uid());

-- Students can view published courses
DROP POLICY IF EXISTS "Students can view courses" ON public.courses;
CREATE POLICY "Students can view courses" ON public.courses
FOR SELECT TO authenticated USING (status = 'published' OR instructor_id = auth.uid());

-- Instructors can view enrollments for their own courses
DROP POLICY IF EXISTS "Instructors view own enrollments" ON public.enrollments;
CREATE POLICY "Instructors view own enrollments" ON public.enrollments
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = enrollments.course_id 
        AND courses.instructor_id = auth.uid()
    )
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) NOT NULL,
    score INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Final Permissions & Cache Reload
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
NOTIFY pgrst, 'reload schema';
