-- ====================================================================
-- PIXORA STUDENT ECOSYSTEM SCHEMA (PHASE 3)
-- ====================================================================

-- 1. Create Learning Track Enum
DO $$ BEGIN
    CREATE TYPE learning_track AS ENUM ('game_dev', 'blockchain', 'agnostic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Profiles Table for Student Features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS learning_track learning_track DEFAULT 'agnostic',
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_coding_hours FLOAT DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Quizzes System
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER, -- in minutes
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_option INTEGER NOT NULL, -- Index of correct option
    points INTEGER DEFAULT 10
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    status TEXT CHECK (status IN ('passed', 'failed')),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Submissions System
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_url TEXT,
    github_url TEXT,
    grade INTEGER,
    feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'resubmit')),
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Gamification (Achievements & Leaderboards)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_type TEXT DEFAULT 'bronze' CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')),
    xp_reward INTEGER DEFAULT 50
);

CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Live Classes
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    instructor_id UUID REFERENCES public.profiles(id),
    meeting_link TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INTEGER, -- in minutes
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled'))
);

-- ====================================================================
-- RLS POLICIES (STUDENT ACCESS)
-- ====================================================================

-- Profiles: Students can read all (for community) but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
CREATE POLICY "Public Profiles Access" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Student Update Own Profile" ON public.profiles;
CREATE POLICY "Student Update Own Profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Quizzes: Students can read if enrolled in course
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrolled Students Read Quizzes" ON public.quizzes;
CREATE POLICY "Enrolled Students Read Quizzes" ON public.quizzes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = quizzes.course_id AND student_id = auth.uid()) OR public.is_super_admin()
);

-- Quiz Attempts: Private to student
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student View Own Attempts" ON public.quiz_attempts;
CREATE POLICY "Student View Own Attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id OR public.is_super_admin());
DROP POLICY IF EXISTS "Student Create Own Attempt" ON public.quiz_attempts;
CREATE POLICY "Student Create Own Attempt" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Submissions: Private to student + accessible by admin
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student View Own Submissions" ON public.submissions;
CREATE POLICY "Student View Own Submissions" ON public.submissions FOR SELECT USING (auth.uid() = student_id OR public.is_super_admin());
DROP POLICY IF EXISTS "Student Create Submissions" ON public.submissions;
CREATE POLICY "Student Create Submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone View Achievements" ON public.achievements;
CREATE POLICY "Everyone View Achievements" ON public.achievements FOR SELECT USING (true);

ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student View Own Achievements" ON public.student_achievements;
CREATE POLICY "Student View Own Achievements" ON public.student_achievements FOR SELECT USING (auth.uid() = student_id OR public.is_super_admin());

-- Live Classes: Enrolled only
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrolled Students View Live" ON public.live_classes;
CREATE POLICY "Enrolled Students View Live" ON public.live_classes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE course_id = live_classes.course_id AND student_id = auth.uid()) OR public.is_super_admin()
);
