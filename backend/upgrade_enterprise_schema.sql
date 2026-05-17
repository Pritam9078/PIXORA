-- ====================================================================
-- PIXORA ENTERPRISE OPERATING SYSTEM SCHEMA (UPGRADE MIGRATION)
-- ====================================================================

-- 1. ADMIN LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- e.g., 'user', 'course', 'system_setting'
    target_id TEXT,
    ip_address TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AUDIT TRAILS
CREATE TABLE IF NOT EXISTS public.audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- e.g., 'INSERT', 'UPDATE', 'DELETE'
    entity_name TEXT NOT NULL, -- e.g., 'courses', 'payments'
    entity_id UUID,
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MODERATION REPORTS
CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- e.g., 'comment', 'discussion', 'course'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 4. MENTOR FEEDBACK
CREATE TABLE IF NOT EXISTS public.mentor_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    feedback_text TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSE REVIEWS
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 6. EVALUATION REPORTS
CREATE TABLE IF NOT EXISTS public.evaluation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    cohort_id UUID, -- References cohort if defined
    evaluation_type TEXT CHECK (evaluation_type IN ('gate', 'midterm', 'final', 'project')),
    technical_score INTEGER CHECK (technical_score BETWEEN 0 AND 100),
    soft_skills_score INTEGER CHECK (soft_skills_score BETWEEN 0 AND 100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID, -- References lesson if defined
    completed BOOLEAN DEFAULT FALSE,
    watch_time_seconds INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- 8. COHORT PROGRESS
CREATE TABLE IF NOT EXISTS public.cohort_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL,
    attendance_percentage DECIMAL(5,2) DEFAULT 100.00,
    assignments_completed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GITHUB ACTIVITY
CREATE TABLE IF NOT EXISTS public.github_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    commits_count INTEGER DEFAULT 0,
    pull_requests_count INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, repo_name, activity_date)
);

-- 10. INTERNSHIP STATUS
CREATE TABLE IF NOT EXISTS public.internship_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'offered', 'active', 'completed', 'terminated')),
    weekly_goals JSONB DEFAULT '[]'::jsonb,
    evaluations JSONB DEFAULT '[]'::jsonb,
    offer_letter_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_status ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- ACCESS POLICIES
-- ====================================================================

-- 1. Admin logs & Audit trails: Restricted only to super admins
CREATE POLICY "Admin Logs Super Admin Access" ON public.admin_logs FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Audit Trails Super Admin Access" ON public.audit_trails FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 2. Moderation reports: Anyone can create, super admins manage
CREATE POLICY "Moderation Select policy" ON public.moderation_reports FOR SELECT USING (true);
CREATE POLICY "Moderation Insert policy" ON public.moderation_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Moderation Admin policy" ON public.moderation_reports FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 3. Mentor feedback: Students read their feedback, Mentors & Admins manage
CREATE POLICY "Feedback Student View" ON public.mentor_feedback FOR SELECT USING (auth.uid() = student_id OR auth.uid() = mentor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "Feedback Mentor Manage" ON public.mentor_feedback FOR ALL USING (auth.uid() = mentor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 4. Course reviews: Read by all, insert/update by the target student, manage by admin
CREATE POLICY "Reviews Select" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Reviews Student Manage" ON public.course_reviews FOR ALL USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 5. Evaluation reports: Student views, evaluators & admins manage
CREATE POLICY "Evaluations Student View" ON public.evaluation_reports FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));
CREATE POLICY "Evaluations Staff Manage" ON public.evaluation_reports FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));

-- 6. Learning Progress: Students view/manage own progress, admins read
CREATE POLICY "Learning Progress Student View" ON public.learning_progress FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));
CREATE POLICY "Learning Progress Student Update" ON public.learning_progress FOR ALL USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));

-- 7. Cohort progress: Students read own progress, admins/instructors manage
CREATE POLICY "Cohort Progress Student View" ON public.cohort_progress FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));
CREATE POLICY "Cohort Progress Admin Manage" ON public.cohort_progress FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));

-- 8. GitHub activity: Read by student/instructor/admin, admin/instructor updates
CREATE POLICY "GitHub Select" ON public.github_activity FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));
CREATE POLICY "GitHub Manage" ON public.github_activity FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));

-- 9. Internship status: Read by student/instructor/admin, admin/instructor updates
CREATE POLICY "Internship Select" ON public.internship_status FOR SELECT USING (auth.uid() = student_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));
CREATE POLICY "Internship Manage" ON public.internship_status FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'instructor'));

-- ====================================================================
-- GRANT ACCESS PRIVILEGES
-- ====================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;

-- ====================================================================
-- REALTIME REGISTRATION
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.mentor_feedback,
    public.evaluation_reports,
    public.learning_progress,
    public.cohort_progress,
    public.github_activity,
    public.internship_status;

-- Reload postgrest cache
NOTIFY pgrst, 'reload schema';
