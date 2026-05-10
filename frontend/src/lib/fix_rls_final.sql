-- ====================================================================
-- FINAL RLS RECURSION FIX FOR PIXORA
-- ====================================================================

-- 1. Create Security Definer functions to break recursion
-- These run with the privileges of the creator (bypass RLS)

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'super_admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_college_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'college_admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_college_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT college_id
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Clean up and Fix Profiles Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile Select Policy" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profile Update Policy" ON public.profiles;
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Profiles Access" ON public.profiles;
DROP POLICY IF EXISTS "Student Update Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Safe Select: Own profile OR Super Admin OR Same College Admin
CREATE POLICY "Profiles Select Fix" 
ON public.profiles FOR SELECT 
USING (
    auth.uid() = id 
    OR 
    public.is_super_admin()
    OR 
    (public.is_college_admin() AND college_id = public.get_user_college_id())
);

-- Safe Insert: Only self
CREATE POLICY "Profiles Insert Fix" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Safe Update: Self OR Super Admin
CREATE POLICY "Profiles Update Fix" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_super_admin());

-- 3. Fix Policies on other tables (Example: Courses, Assignments)
-- We need to replace recursive policies on ALL tables

-- Courses
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.courses;
CREATE POLICY "Courses Admin Access" ON public.courses FOR ALL USING (public.is_super_admin());

-- Assignments
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.assignments;
DROP POLICY IF EXISTS "Super Admin Assignment Access" ON public.assignments;
CREATE POLICY "Assignments Admin Access" ON public.assignments FOR ALL USING (public.is_super_admin());

-- Quizzes
DROP POLICY IF EXISTS "Super Admin Full Access" ON public.quizzes;
DROP POLICY IF EXISTS "Super Admin Quiz Access" ON public.quizzes;
CREATE POLICY "Quizzes Admin Access" ON public.quizzes FOR ALL USING (public.is_super_admin());

-- Media
DROP POLICY IF EXISTS "Media Manage Policy" ON public.media_metadata;
CREATE POLICY "Media Admin Access" ON public.media_metadata FOR ALL USING (public.is_super_admin());

-- Colleges
DROP POLICY IF EXISTS "Colleges Manage Policy" ON public.colleges;
CREATE POLICY "Colleges Admin Access" ON public.colleges FOR ALL USING (public.is_super_admin());
