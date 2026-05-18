-- ============================================================
-- Pixora Storage Fix: RLS Policies for avatars Bucket
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable RLS on storage.objects if not already enabled (typically enabled by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies for the avatars bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Read Access for Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Upload Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Update Avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Delete Avatar" ON storage.objects;

-- 1. SELECT: Allow anyone (public/anon/authenticated) to read avatar files
CREATE POLICY "Public Read Access for Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. INSERT: Allow authenticated users to upload their own avatar files
-- The check ensures the user's UUID is part of the filename path
CREATE POLICY "Authenticated User Upload Avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND name LIKE '%' || auth.uid()::text || '%'
);

-- 3. UPDATE: Allow authenticated users to update their own avatar files
CREATE POLICY "Authenticated User Update Avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE '%' || auth.uid()::text || '%'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE '%' || auth.uid()::text || '%'
);

-- 4. DELETE: Allow authenticated users to delete their own avatar files
CREATE POLICY "Authenticated User Delete Avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND name LIKE '%' || auth.uid()::text || '%'
);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
