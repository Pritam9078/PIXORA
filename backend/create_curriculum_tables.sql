-- Ensure modules table exists
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure lessons table exists
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content_type TEXT DEFAULT 'video',
    content_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS for modules and lessons
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Modules policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view modules') THEN
        CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Instructors can manage modules for their courses') THEN
        CREATE POLICY "Instructors can manage modules for their courses" ON public.modules
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.courses
                    WHERE courses.id = modules.course_id
                    AND courses.instructor_id = auth.uid()
                )
            );
    END IF;

    -- Lessons policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view lessons') THEN
        CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Instructors can manage lessons for their modules') THEN
        CREATE POLICY "Instructors can manage lessons for their modules" ON public.lessons
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.modules
                    JOIN public.courses ON courses.id = modules.course_id
                    WHERE modules.id = lessons.module_id
                    AND courses.instructor_id = auth.uid()
                )
            );
    END IF;
END $$;

GRANT ALL ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
GRANT ALL ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
