-- ====================================================================
-- PIXORA INSTRUCTOR ECOSYSTEM SCHEMA
-- ====================================================================

-- 1. Modules Table (Hierarchy Level 1)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Lessons Table (Hierarchy Level 2)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'document', 'quiz', 'assignment', 'code')),
    content_url TEXT,
    description TEXT,
    duration_seconds INTEGER,
    is_free_preview BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Lesson Progress (Real-time Watch Tracking)
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    watch_percent INTEGER DEFAULT 0,
    last_timestamp FLOAT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- 4. Instructor Earnings & Payouts
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payout_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- RLS POLICIES (INSTRUCTOR ACCESS)
-- ====================================================================

-- Courses: Instructors can manage their own courses
DROP POLICY IF EXISTS "Instructors can manage own courses" ON public.courses;
CREATE POLICY "Instructors can manage own courses" ON public.courses 
FOR ALL USING (
    auth.uid() = instructor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Modules: Instructors can manage modules of their courses
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage own modules" ON public.modules;
CREATE POLICY "Instructors manage own modules" ON public.modules 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND instructor_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Lessons: Instructors can manage lessons of their modules
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage own lessons" ON public.lessons;
CREATE POLICY "Instructors manage own lessons" ON public.lessons 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = lessons.module_id AND c.instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Student Progress: Instructors can view progress for their courses
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors view progress for own courses" ON public.student_lesson_progress;
CREATE POLICY "Instructors view progress for own courses" ON public.student_lesson_progress 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = student_lesson_progress.course_id AND instructor_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Payouts: Instructors can view their own payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors view own payouts" ON public.payouts;
CREATE POLICY "Instructors view own payouts" ON public.payouts 
FOR SELECT USING (auth.uid() = instructor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- ====================================================================
-- REALTIME SETUP
-- ====================================================================
-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.modules, public.lessons, public.student_lesson_progress, public.courses;
