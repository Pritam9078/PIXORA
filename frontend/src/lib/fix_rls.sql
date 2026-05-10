-- Allow users to insert their own profile (Required for upsert)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure profiles can be updated
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
CREATE POLICY "Users can update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
