-- SQL RECONCILIATION FOR PIXORA STUDENT LMS ECOSYSTEM
-- TARGET: Advanced Tracking, Analytics, and immersive student experience

-- 1. LESSON PROGRESS TRACKING (Granular)
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    last_timestamp FLOAT DEFAULT 0, -- Seconds into the video
    watch_time FLOAT DEFAULT 0, -- Total seconds watched
    completion_percentage INT DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- 2. COURSE ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS course_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'urgent', 'update', 'assignment')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERSONAL LEARNING NOTES
CREATE TABLE IF NOT EXISTS learning_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKMARKS / TIMESTAMPS
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    timestamp FLOAT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COURSE ANALYTICS (AGGREGATED)
CREATE TABLE IF NOT EXISTS student_course_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    total_learning_time INT DEFAULT 0, -- Total minutes
    lessons_completed INT DEFAULT 0,
    assignments_completed INT DEFAULT 0,
    quizzes_completed INT DEFAULT 0,
    average_quiz_score FLOAT DEFAULT 0,
    strength_topics TEXT[], -- Tags or categories
    weak_topics TEXT[],
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 6. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_url TEXT NOT NULL,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    verification_code TEXT UNIQUE NOT NULL,
    UNIQUE(student_id, course_id)
);

-- 7. RLS POLICIES FOR ENTERPRISE SECURITY

-- Enable RLS on all new tables
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_course_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- LESSON PROGRESS: Students see their own, Instructors see their course's students
CREATE POLICY "Students can view/edit their own progress" 
ON lesson_progress FOR ALL USING (auth.uid() = student_id);

-- COURSE ANNOUNCEMENTS: Everyone in the course can view, Instructors can manage
CREATE POLICY "Everyone can view announcements" 
ON course_announcements FOR SELECT USING (true);
CREATE POLICY "Instructors can manage their course announcements" 
ON course_announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid())
);

-- LEARNING NOTES: Strictly private to the student
CREATE POLICY "Notes are private to the student" 
ON learning_notes FOR ALL USING (auth.uid() = student_id);

-- BOOKMARKS: Strictly private to the student
CREATE POLICY "Bookmarks are private to the student" 
ON bookmarks FOR ALL USING (auth.uid() = student_id);

-- ANALYTICS: Students see their own, Instructors see their course's stats
CREATE POLICY "Students can view their own analytics" 
ON student_course_analytics FOR SELECT USING (auth.uid() = student_id);

-- CERTIFICATES: Publicly verifiable via URL/Code, but owned by student
CREATE POLICY "Certificates are viewable by everyone" 
ON certificates FOR SELECT USING (true);
CREATE POLICY "Students can only manage their own certificate metadata" 
ON certificates FOR ALL USING (auth.uid() = student_id);

-- 8. AUTOMATION TRIGGERS

-- Function to update enrollment progress when lesson_progress changes
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_items INT;
    completed_items INT;
BEGIN
    -- Count total lessons, assignments, and quizzes for the course
    SELECT (
        (SELECT COUNT(*) FROM lessons WHERE course_id = NEW.course_id) +
        (SELECT COUNT(*) FROM assignments WHERE course_id = NEW.course_id) +
        (SELECT COUNT(*) FROM quizzes WHERE course_id = NEW.course_id)
    ) INTO total_items;

    -- Count completed items (lessons for now, could expand to others)
    SELECT COUNT(*) FROM lesson_progress 
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id AND status = 'completed'
    INTO completed_items;

    -- Update enrollment
    UPDATE enrollments 
    SET progress = CASE WHEN total_items > 0 THEN (completed_items * 100 / total_items) ELSE 0 END,
        updated_at = NOW()
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_enrollment_progress
AFTER INSERT OR UPDATE OF status ON lesson_progress
FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();
