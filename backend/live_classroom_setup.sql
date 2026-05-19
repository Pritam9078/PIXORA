-- ====================================================================
-- PIXORA: LIVE CLASSROOM HARMONIZATION & CHAT SYSTEM
-- Run this migration in your Supabase SQL Editor to prepare the database.
-- ====================================================================

-- 1. Ensure live_classes table has all unified columns from both schemas, and drop NOT NULL constraint on course_id
ALTER TABLE public.live_classes 
  ALTER COLUMN course_id DROP NOT NULL;

ALTER TABLE public.live_classes 
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- 1.5 Recreate RLS Select Policy on live_classes to allow viewing general streams (where course_id is null)
DROP POLICY IF EXISTS "Students can view live classes for enrolled courses" ON public.live_classes;
DROP POLICY IF EXISTS "Enrolled Students View Live" ON public.live_classes;

CREATE POLICY "Students can view live classes for enrolled courses"
  ON public.live_classes FOR SELECT
  USING (
    course_id IS NULL
    OR EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.course_id = live_classes.course_id
        AND e.student_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = live_classes.course_id
        AND c.instructor_id = auth.uid()
    )
  );

-- 2. Create the Realtime Live Chat Messages table
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.live_classes(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid conflicts on re-runs
DROP POLICY IF EXISTS "Anyone enrolled in the course can view chat" ON public.live_chat_messages;
DROP POLICY IF EXISTS "Students can insert their own chat messages" ON public.live_chat_messages;

-- 5. Establish exact access control policies
-- Students can read chat messages for sessions they have access to view
CREATE POLICY "Anyone enrolled in the course can view chat" 
  ON public.live_chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.live_classes lc
      WHERE lc.id = live_chat_messages.session_id
    )
  );

-- Students and instructors can post chat messages if they are the authenticated sender
CREATE POLICY "Students can insert their own chat messages" 
  ON public.live_chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- 6. Grant appropriate privileges to access roles
GRANT ALL ON public.live_chat_messages TO authenticated;
GRANT ALL ON public.live_chat_messages TO service_role;

-- 7. Add public table to Supabase Realtime publication
-- This enables live subscription push notifications
-- Wrapped in an idempotent DO block to prevent 42710 relation already member of publication errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime'
      AND c.relname = 'live_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
  END IF;
END $$;

-- 8. Reload PostgREST Cache
NOTIFY pgrst, 'reload schema';
