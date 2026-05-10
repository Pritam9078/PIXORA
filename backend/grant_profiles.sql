-- Allow all authenticated users to read profiles (instructors need student names/emails)
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Also ensure enrollments allow reading student_id for instructor queries
GRANT SELECT ON public.enrollments TO authenticated;

NOTIFY pgrst, 'reload schema';
