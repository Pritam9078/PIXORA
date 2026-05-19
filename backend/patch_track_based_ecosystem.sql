-- ====================================================================
-- PIXORA SYSTEM MIGRATION: TRACK-BASED AND COHORT-AWARE ECOSYSTEM
-- ====================================================================

-- 1. EXTEND PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_track TEXT;

-- Trigger to sync 'learning_track' (lowercase) and 'track' (uppercase) for backward compatibility
CREATE OR REPLACE FUNCTION public.trg_sync_profile_tracks()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync track to learning_track
    IF NEW.track IS NOT NULL AND (NEW.learning_track IS NULL OR UPPER(NEW.learning_track::TEXT) != NEW.track) THEN
        IF NEW.track = 'BLOCKCHAIN' THEN
            NEW.learning_track := 'blockchain';
        ELSIF NEW.track = 'GAME_DEV' THEN
            NEW.learning_track := 'game_dev';
        END IF;
    -- Sync learning_track to track
    ELSIF NEW.learning_track IS NOT NULL AND (NEW.track IS NULL OR NEW.track != UPPER(NEW.learning_track::TEXT)) THEN
        IF NEW.learning_track::TEXT = 'blockchain' THEN
            NEW.track := 'BLOCKCHAIN';
        ELSIF NEW.learning_track::TEXT = 'game_dev' THEN
            NEW.track := 'GAME_DEV';
        ELSE
            NEW.track := NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_profile_tracks_on_profiles ON public.profiles;
CREATE TRIGGER trg_sync_profile_tracks_on_profiles
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trg_sync_profile_tracks();

-- Backfill existing data if track or learning_track is already set
UPDATE public.profiles SET track = 'BLOCKCHAIN', learning_track = 'blockchain' WHERE learning_track::TEXT = 'blockchain' OR track = 'BLOCKCHAIN';
UPDATE public.profiles SET track = 'GAME_DEV', learning_track = 'game_dev' WHERE learning_track::TEXT = 'game_dev' OR track = 'GAME_DEV';

-- 2. EXTEND COURSES
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'cohort_only', 'institution_only'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL;

-- 3. EXTEND LIVE CLASSES & LIVE SESSIONS
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.live_classes ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;

ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.live_sessions ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;

-- 4. EXTEND ASSIGNMENTS & QUIZZES
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- 5. EXTEND STUDENT PROGRESS TABLES
ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));
ALTER TABLE public.lesson_progress ADD COLUMN IF NOT EXISTS track TEXT CHECK (track IN ('BLOCKCHAIN', 'GAME_DEV'));

-- 6. SECURITY: RESET AND DEFINE ENFORCED RLS SELECT POLICIES

-- Super Admin bypass function helper check to avoid recursion
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.1 COURSES SELECT POLICY
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enforced course track & visibility selection" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can view draft courses" ON public.courses;

CREATE POLICY "Enforced course track & visibility selection" ON public.courses
FOR SELECT USING (
    public.is_super_admin()
    OR (
        status = 'published'
        AND (
            track IS NULL 
            OR track = (SELECT track FROM public.profiles WHERE id = auth.uid())
        )
        AND (
            visibility = 'public'
            OR (visibility = 'cohort_only' AND cohort_id = (SELECT cohort_id FROM public.profiles WHERE id = auth.uid()))
            OR (visibility = 'institution_only' AND college_id = (SELECT college_id FROM public.profiles WHERE id = auth.uid()))
        )
    )
    OR (instructor_id = auth.uid()) -- Instructor can see their own course
);

-- 6.2 LIVE CLASSES SELECT POLICY
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrolled Students View Live" ON public.live_classes;
DROP POLICY IF EXISTS "Students can view live classes for enrolled courses" ON public.live_classes;

CREATE POLICY "Enrolled Students View Live" ON public.live_classes
FOR SELECT USING (
    public.is_super_admin()
    OR (
        (track IS NULL OR track = (SELECT track FROM public.profiles WHERE id = auth.uid()))
        AND (
            cohort_id IS NULL 
            OR cohort_id = (SELECT cohort_id FROM public.profiles WHERE id = auth.uid())
        )
    )
);

-- 6.3 ASSIGNMENTS SELECT POLICY
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view their assignments" ON public.assignments;

CREATE POLICY "Students view their assignments" ON public.assignments
FOR SELECT USING (
    public.is_super_admin()
    OR (
        (track IS NULL OR track = (SELECT track FROM public.profiles WHERE id = auth.uid()))
    )
);

-- 6.4 QUIZZES SELECT POLICY
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view their quizzes" ON public.quizzes;

CREATE POLICY "Students view their quizzes" ON public.quizzes
FOR SELECT USING (
    public.is_super_admin()
    OR (
        (track IS NULL OR track = (SELECT track FROM public.profiles WHERE id = auth.uid()))
    )
);

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
