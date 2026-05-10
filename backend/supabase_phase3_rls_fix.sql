-- ============================================================
-- Pixora Phase 3: Instructor & Student RLS Policies + Missing Tables
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================


-- ============================================================
-- SECTION 1: COURSES TABLE RLS
-- The current schema only has Super Admin access.
-- Add instructor + student policies.
-- ============================================================

DROP POLICY IF EXISTS "Instructors can read own courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view published courses" ON public.courses;

-- Instructors: full access to their own courses
CREATE POLICY "Instructors can read own courses"
ON public.courses FOR SELECT
TO authenticated
USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can insert own courses"
ON public.courses FOR INSERT
TO authenticated
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update own courses"
ON public.courses FOR UPDATE
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

-- Students: view published courses
CREATE POLICY "Students can view published courses"
ON public.courses FOR SELECT
TO authenticated
USING (status = 'published');


-- ============================================================
-- SECTION 2: ENROLLMENTS TABLE RLS
-- ============================================================

DROP POLICY IF EXISTS "Students can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can enroll" ON public.enrollments;
DROP POLICY IF EXISTS "Instructors can view course enrollments" ON public.enrollments;

-- Students: view and manage their own enrollments
CREATE POLICY "Students can view own enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can enroll"
ON public.enrollments FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Instructors: view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments"
ON public.enrollments FOR SELECT
TO authenticated
USING (
  course_id IN (
    SELECT id FROM public.courses WHERE instructor_id = auth.uid()
  )
);


-- ============================================================
-- SECTION 3: ASSIGNMENTS TABLE (create if missing) + RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assignments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    TIMESTAMPTZ,
  max_points  INTEGER DEFAULT 100,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;

DROP POLICY IF EXISTS "Instructors can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students can view assignments" ON public.assignments;

-- Instructors: manage assignments for their courses
CREATE POLICY "Instructors can manage assignments"
ON public.assignments FOR ALL
TO authenticated
USING (
  course_id IN (
    SELECT id FROM public.courses WHERE instructor_id = auth.uid()
  )
);

-- Students: view assignments for enrolled courses
CREATE POLICY "Students can view assignments"
ON public.assignments FOR SELECT
TO authenticated
USING (
  course_id IN (
    SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
  )
);


-- ============================================================
-- SECTION 4: SUBMISSIONS TABLE (create if missing) + RLS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id  UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_url TEXT,
  grade          INTEGER,
  feedback       TEXT,
  status         TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  submitted_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.submissions TO authenticated;

DROP POLICY IF EXISTS "Students can manage own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Instructors can view submissions" ON public.submissions;

CREATE POLICY "Students can manage own submissions"
ON public.submissions FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (
  assignment_id IN (
    SELECT a.id FROM public.assignments a
    JOIN public.courses c ON a.course_id = c.id
    WHERE c.instructor_id = auth.uid()
  )
);


-- ============================================================
-- SECTION 5: CREATE MISSING quizzes TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quizzes (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id           UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  time_limit_minutes  INTEGER DEFAULT 0,
  passing_score       INTEGER DEFAULT 70,
  is_published        BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;

DROP POLICY IF EXISTS "Instructors can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Students can view published quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.quizzes;

CREATE POLICY "Super Admin Full Access"
ON public.quizzes FOR ALL
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

CREATE POLICY "Instructors can manage quizzes"
ON public.quizzes FOR ALL
TO authenticated
USING (
  course_id IN (
    SELECT id FROM public.courses WHERE instructor_id = auth.uid()
  )
);

CREATE POLICY "Students can view published quizzes"
ON public.quizzes FOR SELECT
TO authenticated
USING (
  is_published = true
  AND course_id IN (
    SELECT course_id FROM public.enrollments WHERE student_id = auth.uid()
  )
);


-- ============================================================
-- SECTION 6: FIX enrollments.progress column alias
-- The schema uses `progress` (integer) but the frontend queries
-- `progress_percent`. Add an alias column or rename.
-- ============================================================

-- Option A: Add progress_percent as a generated column (alias)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS progress_percent INTEGER GENERATED ALWAYS AS (progress) STORED;

-- If the above fails (Postgres < 12 or constraint issue), use Option B:
-- ALTER TABLE public.enrollments RENAME COLUMN progress TO progress_percent;
-- (Only use Option B if Option A fails)


-- ============================================================
-- SECTION 7: REFRESH SCHEMA CACHE
-- ============================================================

NOTIFY pgrst, 'reload schema';
