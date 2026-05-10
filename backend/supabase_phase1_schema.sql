-- Phase 1: Foundation & RBAC Setup - Supabase Schema Migration

-- 1. Create Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on colleges
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- 2. Update Profiles Table (Assuming it exists, we alter it to support the new roles and college_id)
-- If the table doesn't exist, we'll create it.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('super_admin', 'college_admin', 'student', 'instructor', 'partner')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  avatar_url TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the role constraint is present if the table already existed with an old constraint
DO $$
BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin', 'college_admin', 'student', 'instructor', 'partner'));
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Profiles
-- Drop old policies to prevent conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- SELECT Policy
-- Super Admins can see all.
-- College Admins can see profiles within their college.
-- Users can always see their own profile.
CREATE POLICY "Profile Select Policy" 
ON public.profiles FOR SELECT 
USING (
    auth.uid() = id -- Own profile
    OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' -- Super Admin
    OR 
    (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'college_admin' 
        AND 
        college_id = (SELECT college_id FROM public.profiles WHERE id = auth.uid())
    ) -- College Admin viewing their college members
);

-- INSERT Policy (Needed for trigger or auth flow)
CREATE POLICY "Profile Insert Policy" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- UPDATE Policy
CREATE POLICY "Profile Update Policy" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id) -- Users can update their own
WITH CHECK (auth.uid() = id);

-- Super Admin Bypass Policy for Update/Delete
CREATE POLICY "Super Admin Full Access" 
ON public.profiles FOR ALL 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- 4. RLS Policies for Colleges
DROP POLICY IF EXISTS "Colleges Select Policy" ON public.colleges;

-- Anyone can see active colleges (for signup lists, etc.)
CREATE POLICY "Colleges Select Policy" 
ON public.colleges FOR SELECT 
USING (status = 'active' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');

-- Only super admins can manage colleges
CREATE POLICY "Colleges Manage Policy" 
ON public.colleges FOR ALL 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin');
