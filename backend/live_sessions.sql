CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES auth.users(id) NOT NULL,
    course_id UUID REFERENCES public.courses(id),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_mins INTEGER DEFAULT 60,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Instructors can manage their own live sessions') THEN
        CREATE POLICY "Instructors can manage their own live sessions" ON public.live_sessions
            FOR ALL USING (auth.uid() = instructor_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can view live sessions for their courses') THEN
        CREATE POLICY "Students can view live sessions for their courses" ON public.live_sessions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.enrollments
                    WHERE enrollments.course_id = live_sessions.course_id
                    AND enrollments.student_id = auth.uid()
                )
            );
    END IF;
END $$;

GRANT ALL ON public.live_sessions TO authenticated;
GRANT ALL ON public.live_sessions TO service_role;
