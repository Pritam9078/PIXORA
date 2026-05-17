-- ============================================================================
-- PIXORA ENTERPRISE DATABASE RECONCILIATION MIGRATION
-- Target: Remote Supabase Instance
-- Purpose: Safely reconciles certificates, payments, and notifications tables,
--          sets up robust RLS policies, grants user role permissions, and
--          reloads PostgREST cache schema.
-- ============================================================================

-- Ensure uuid extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CERTIFICATES TABLE RECONCILIATION
-- Supports both designed templates (from Admin console) and student-issued logs.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    verification_code TEXT UNIQUE,
    title TEXT,
    description TEXT,
    on_chain BOOLEAN DEFAULT TRUE,
    issued_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Safely append missing columns in case certificates already exists
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS verification_code TEXT UNIQUE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS on_chain BOOLEAN DEFAULT TRUE;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issued_count INTEGER DEFAULT 0;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on Certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for Certificates
DROP POLICY IF EXISTS "Certificates are viewable by everyone" ON public.certificates;
CREATE POLICY "Certificates are viewable by everyone" ON public.certificates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can manage all certificates" ON public.certificates;
CREATE POLICY "Super admins can manage all certificates" ON public.certificates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Students can only manage their own certificate metadata" ON public.certificates;
CREATE POLICY "Students can only manage their own certificate metadata" ON public.certificates
    FOR ALL USING (auth.uid() = student_id);

-- ============================================================================
-- 2. PAYMENTS TABLE RECONCILIATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    provider TEXT,
    provider_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely append missing columns in case payments already exists
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS on Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for Payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admins can manage all payments" ON public.payments;
CREATE POLICY "Super admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 3. NOTIFICATIONS TABLE RECONCILIATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'ALERT' CHECK (type IN ('ALERT', 'PROMO', 'AUTO')),
    target TEXT DEFAULT 'ALL' CHECK (target IN ('ALL', 'STUDENTS', 'INSTRUCTORS', 'PARTNERS')),
    status TEXT DEFAULT 'SENT',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for Notifications
DROP POLICY IF EXISTS "Everyone can view notifications" ON public.notifications;
CREATE POLICY "Everyone can view notifications" ON public.notifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can manage all notifications" ON public.notifications;
CREATE POLICY "Super admins can manage all notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 4. PRIVILEGE & ROLE GRANTS
-- Enables frontend Web SDK endpoints to query tables under auth session.
-- ============================================================================

GRANT ALL PRIVILEGES ON public.certificates TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON public.payments TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON public.notifications TO postgres, service_role, authenticated, anon;

-- ============================================================================
-- 5. RELOAD POSTGREST SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';
