-- Schema extension for Media, Assignments, and Quizzes

-- 1. Media Metadata Table
CREATE TABLE IF NOT EXISTS public.media_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- path in the 'media' bucket
    file_type TEXT NOT NULL, -- image, video, document, archive
    size_bytes BIGINT NOT NULL,
    mime_type TEXT,
    thumbnail_url TEXT,
    folder TEXT DEFAULT 'root', -- basic folder organization
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.media_metadata ENABLE ROW LEVEL SECURITY;

-- Policies for Media
CREATE POLICY "Media Select Policy" ON public.media_metadata FOR SELECT USING (true); -- Publicly viewable or restricted by app logic
CREATE POLICY "Media Manage Policy" ON public.media_metadata FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 2. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID, -- Placeholder if courses table not fully defined yet
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID,
    time_limit_minutes INTEGER,
    passing_score INTEGER DEFAULT 70,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for LMS tables
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Simple All-Access for Super Admins
CREATE POLICY "Super Admin Assignment Access" ON public.assignments FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Super Admin Quiz Access" ON public.quizzes FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);
