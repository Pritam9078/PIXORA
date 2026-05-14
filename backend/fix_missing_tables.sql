-- ====================================================================
-- PIXORA: FIX MISSING TABLES & RELATIONSHIPS
-- Run this in the Supabase SQL Editor to fix 400/404 errors.
-- ====================================================================

-- ─────────────────────────────────────────────────────────
-- 1. ENSURE assignments HAS module_id (for module-level join)
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instructions TEXT,
  ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100;

-- ─────────────────────────────────────────────────────────
-- 2. ENSURE quizzes HAS module_id (for module-level join)
-- ─────────────────────────────────────────────────────────
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- ─────────────────────────────────────────────────────────
-- 3. CREATE quiz_attempts (missing → 404 errors)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id      UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score        NUMERIC DEFAULT 0,
    max_score    NUMERIC DEFAULT 100,
    status       TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'failed')),
    answers      JSONB DEFAULT '{}',
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quiz_attempts' AND policyname='Students can view their own attempts') THEN
        CREATE POLICY "Students can view their own attempts"
            ON public.quiz_attempts FOR SELECT
            USING (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quiz_attempts' AND policyname='Students can insert their own attempts') THEN
        CREATE POLICY "Students can insert their own attempts"
            ON public.quiz_attempts FOR INSERT
            WITH CHECK (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='quiz_attempts' AND policyname='Instructors can view attempts for their quizzes') THEN
        CREATE POLICY "Instructors can view attempts for their quizzes"
            ON public.quiz_attempts FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.quizzes q
                    JOIN public.courses c ON c.id = q.course_id
                    WHERE q.id = quiz_attempts.quiz_id
                    AND c.instructor_id = auth.uid()
                )
            );
    END IF;
END $$;

GRANT ALL ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;

-- ─────────────────────────────────────────────────────────
-- 4. CREATE learning_notes (missing → 404 errors)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id  UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    content    TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, lesson_id)
);

ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='learning_notes' AND policyname='Students can manage their own notes') THEN
        CREATE POLICY "Students can manage their own notes"
            ON public.learning_notes FOR ALL
            USING (auth.uid() = student_id)
            WITH CHECK (auth.uid() = student_id);
    END IF;
END $$;

GRANT ALL ON public.learning_notes TO authenticated;
GRANT ALL ON public.learning_notes TO service_role;

-- ─────────────────────────────────────────────────────────
-- 5. CREATE live_classes (missing → 404 errors)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.live_classes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title        TEXT NOT NULL,
    description  TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url  TEXT,
    status       TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='live_classes' AND policyname='Students can view live classes for enrolled courses') THEN
        CREATE POLICY "Students can view live classes for enrolled courses"
            ON public.live_classes FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.enrollments e
                    WHERE e.course_id = live_classes.course_id
                    AND e.student_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.courses c
                    WHERE c.id = live_classes.course_id
                    AND c.instructor_id = auth.uid()
                )
            );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='live_classes' AND policyname='Instructors can manage their live classes') THEN
        CREATE POLICY "Instructors can manage their live classes"
            ON public.live_classes FOR ALL
            USING (auth.uid() = instructor_id)
            WITH CHECK (auth.uid() = instructor_id);
    END IF;
END $$;

GRANT ALL ON public.live_classes TO authenticated;
GRANT ALL ON public.live_classes TO service_role;

-- ─────────────────────────────────────────────────────────
-- 6. CREATE lesson_progress (if not exists)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id             UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id             UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status                TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    last_timestamp        NUMERIC DEFAULT 0,
    last_accessed_at      TIMESTAMPTZ DEFAULT NOW(),
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_progress' AND policyname='Students can manage their own progress') THEN
        CREATE POLICY "Students can manage their own progress"
            ON public.lesson_progress FOR ALL
            USING (auth.uid() = student_id)
            WITH CHECK (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lesson_progress' AND policyname='Instructors can view progress for their courses') THEN
        CREATE POLICY "Instructors can view progress for their courses"
            ON public.lesson_progress FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.courses c
                    WHERE c.id = lesson_progress.course_id
                    AND c.instructor_id = auth.uid()
                )
            );
    END IF;
END $$;

GRANT ALL ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;

-- ─────────────────────────────────────────────────────────
-- 7. CREATE questions table (for quiz questions)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    text          TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options       JSONB DEFAULT '[]',
    correct_answer TEXT,
    points        INTEGER DEFAULT 1,
    order_index   INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='questions' AND policyname='Anyone enrolled can view questions') THEN
        CREATE POLICY "Anyone enrolled can view questions"
            ON public.questions FOR SELECT
            USING (true);
    END IF;
END $$;

GRANT ALL ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;

-- ─────────────────────────────────────────────────────────
-- 8. CREATE submissions table (for assignment submissions)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submissions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    content       TEXT,
    github_url    TEXT,
    status        TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'resubmitted')),
    grade         JSONB,  -- { score, max_score, feedback }
    submitted_at  TIMESTAMPTZ DEFAULT NOW(),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='submissions' AND policyname='Students can manage their own submissions') THEN
        CREATE POLICY "Students can manage their own submissions"
            ON public.submissions FOR ALL
            USING (auth.uid() = student_id)
            WITH CHECK (auth.uid() = student_id);
    END IF;
END $$;

GRANT ALL ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;

-- ─────────────────────────────────────────────────────────
-- 9. RELOAD PostgREST schema cache
-- ─────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
