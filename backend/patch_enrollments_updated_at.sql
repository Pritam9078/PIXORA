-- ====================================================================
-- PIXORA SCHEMA PATCH: ADD MISSING UPDATED_AT COLUMN TO ENROLLMENTS
-- Run this migration in your Supabase SQL Editor to resolve the 400 error
-- caused by the trg_update_enrollment_progress trigger.
-- ====================================================================

-- 1. Ensure the updated_at column exists in public.enrollments
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Force PostgREST schema cache reload to update API endpoints
NOTIFY pgrst, 'reload schema';
