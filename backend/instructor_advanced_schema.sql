-- ====================================================================
-- PIXORA SUPER INSTRUCTOR ECOSYSTEM SCHEMA (PHASE 3)
-- ====================================================================

-- ====================================================================
-- 1. MEDIA & RESOURCE LIBRARY
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('video', 'pdf', 'image', 'code', 'archive')),
    size_bytes BIGINT,
    folder TEXT DEFAULT 'root',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_tags (
    media_id UUID REFERENCES public.media_library(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (media_id, tag)
);

-- ====================================================================
-- 2. ASSIGNMENTS & SUBMISSIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructions TEXT,
    due_date TIMESTAMPTZ,
    assignment_type TEXT CHECK (assignment_type IN ('theory', 'coding', 'project', 'upload')),
    rubric JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_url TEXT,
    content TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'late', 'resubmit')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE UNIQUE,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    score DECIMAL(5, 2),
    max_score DECIMAL(5, 2) DEFAULT 100.00,
    feedback TEXT,
    graded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. QUIZZES & ASSESSMENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    time_limit_minutes INTEGER,
    attempt_limit INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_type TEXT CHECK (question_type IN ('mcq', 'coding', 'text')),
    content TEXT NOT NULL,
    options JSONB, -- For MCQs: [{"id": 1, "text": "Option A"}, ...]
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score DECIMAL(5, 2),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timeout')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    answers JSONB -- Store student answers here
);

-- ====================================================================
-- 4. OPERATIONS & LIVE CLASSES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    platform TEXT DEFAULT 'webrtc' CHECK (platform IN ('webrtc', 'zoom', 'agora')),
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL, -- e.g., 'course_completed', 'assignment_late'
    action_type TEXT NOT NULL, -- e.g., 'send_email', 'issue_certificate'
    action_payload JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- RLS POLICIES (INSTRUCTOR ACCESS)
-- ====================================================================

-- Media Library: Instructors manage their own media
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage own media" ON public.media_library;
CREATE POLICY "Instructors manage own media" ON public.media_library 
FOR ALL USING (auth.uid() = instructor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- Assignments: Instructors manage assignments for their courses
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage assignments for own courses" ON public.assignments;
CREATE POLICY "Instructors manage assignments for own courses" ON public.assignments 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND instructor_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Submissions & Grades: Instructors view/grade submissions for their assignments
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors view submissions for own assignments" ON public.submissions;
CREATE POLICY "Instructors view submissions for own assignments" ON public.submissions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.courses c ON c.id = a.course_id
        WHERE a.id = submissions.assignment_id AND c.instructor_id = auth.uid()
    )
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage grades for own assignments" ON public.grades;
CREATE POLICY "Instructors manage grades for own assignments" ON public.grades 
FOR ALL USING (auth.uid() = instructor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');


-- Quizzes: Instructors manage quizzes for their courses
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage quizzes for own courses" ON public.quizzes;
CREATE POLICY "Instructors manage quizzes for own courses" ON public.quizzes 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = quizzes.course_id AND instructor_id = auth.uid())
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Live Sessions: Instructors manage their own sessions
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Instructors manage own live sessions" ON public.live_sessions;
CREATE POLICY "Instructors manage own live sessions" ON public.live_sessions 
FOR ALL USING (auth.uid() = instructor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- ====================================================================
-- REALTIME SETUP
-- ====================================================================
-- Enable realtime for the new interactive tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.assignments, 
    public.submissions, 
    public.quiz_attempts, 
    public.live_sessions;
