-- 1. Create or Update Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the necessary columns exist (handles cases where the table was created by a different migration)
ALTER TABLE public.notifications 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS link TEXT;

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Usually restricted to authenticated or service role, but triggers run as postgres

-- 2. Create Trigger for Application Status Updates
CREATE OR REPLACE FUNCTION public.handle_application_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- If approved and it's an instructor application
        IF NEW.status = 'Approved' AND NEW.role_requested = 'instructor' THEN
            -- Update profile role
            UPDATE public.profiles
            SET role = 'instructor'
            WHERE id = NEW.student_id;

            -- Send notification
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.student_id, 
                'Instructor Application Approved! 🎉', 
                'Your application has been approved. You now have access to the Instructor Dashboard.', 
                'success',
                '/instructor/dashboard'
            );
        
        -- If enrolled (finalized)
        ELSIF NEW.status = 'Enrolled' AND NEW.role_requested = 'instructor' THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.student_id, 
                'Onboarding Complete', 
                'Your instructor onboarding is fully complete and active.', 
                'success',
                '/instructor/dashboard'
            );

        -- If rejected / draft
        ELSIF NEW.status = 'Draft' THEN
            -- Revert role if it was instructor (optional safety measure)
            UPDATE public.profiles
            SET role = 'student'
            WHERE id = NEW.student_id AND role = 'instructor';

            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.student_id, 
                'Application Status Update', 
                'Your instructor application has been moved back to Draft status or requires changes.', 
                'warning',
                '/application/instructor'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_status_change ON public.applications;
CREATE TRIGGER on_application_status_change
    AFTER UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_application_status_update();

-- 3. Set up Storage Bucket for Applications
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pixora-applications', 'pixora-applications', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (Authenticated users can upload)
CREATE POLICY "Authenticated users can upload application files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'pixora-applications' AND auth.role() = 'authenticated');

-- RLS for Storage (Admins can view, users can view their own)
CREATE POLICY "Admins and owners can view application files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'pixora-applications' AND 
        (
            auth.uid()::text = (storage.foldername(name))[1] -- assumes files are stored in a folder named after user ID
            OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'college_admin'))
        )
    );

-- 4. Enable Realtime for Applications and Notifications
-- This assumes publication 'supabase_realtime' exists.
DO $$ 
BEGIN
    -- Add applications to realtime
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    END IF;

    -- Add notifications to realtime
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;
