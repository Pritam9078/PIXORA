import { supabase } from '../lib/supabase';

export const CourseService = {
  /**
   * Fetch all courses available for the student's college
   * @param {string} collegeId 
   */
  getAvailableCourses: async (collegeId) => {
    let query = supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url)
      `)
      .eq('status', 'published');

    if (collegeId) {
      query = query.or(`college_id.eq.${collegeId},college_id.is.null`);
    } else {
      query = query.is('college_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Fetch enrolled courses for a student with detailed progress and instructor info
   */
  getEnrolledCourses: async (studentId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses (
          *,
          instructor:profiles!instructor_id (*)
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch a single enrolled course with full curriculum and progress
   */
  getCourseWithFullProgress: async (studentId, courseId) => {
    // 1. Fetch course + modules + lessons only (assignments/quizzes are course-level, not module-level)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id (*),
        modules (
          *,
          lessons (*)
        )
      `)
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) throw courseError;
    if (!course) return null;

    // 2. Fetch assignments and quizzes via course_id (they have no module_id FK)
    const [assignmentsRes, quizzesRes] = await Promise.all([
      supabase.from('assignments').select('*').eq('course_id', courseId),
      supabase.from('quizzes').select('*').eq('course_id', courseId)
    ]);

    const assignments = assignmentsRes.data || [];
    const quizzes    = quizzesRes.data   || [];

    // Attach assignments/quizzes to their module (if module_id set) or first module as fallback
    if (course.modules) {
      course.modules.forEach(m => {
        m.assignments = assignments.filter(a => a.module_id === m.id || !a.module_id);
        m.quizzes     = quizzes.filter(q => q.module_id === m.id || !q.module_id);
        if (m.lessons) {
          m.lessons = m.lessons.map(l => ({
            ...l,
            content_type: l.content_type || (l.content_url ? 'video' : 'reading')
          }));
        }
      });
      // Avoid duplicates: only attach un-assigned items to first module
      const hasModuleId = (item) => !!item.module_id;
      course.modules.forEach((m, idx) => {
        if (idx > 0) {
          m.assignments = m.assignments.filter(hasModuleId);
          m.quizzes     = m.quizzes.filter(hasModuleId);
        }
      });
    }

    // 3. Student progress (lesson-level)
    const { data: progress, error: progressError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (progressError) throw progressError;

    // 4. Quiz attempts — gracefully ignore if table doesn't exist yet
    let quizAttempts = [];
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', studentId);
      if (!error) quizAttempts = data || [];
    } catch (_) { /* table may not exist yet */ }

    // 5. Assignment submissions — gracefully ignore if table doesn't exist yet
    let submissions = [];
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', studentId);
      if (!error) submissions = data || [];
    } catch (_) { /* table may not exist yet */ }

    return {
      ...course,
      studentProgress: progress || [],
      quizAttempts,
      submissions
    };
  },

  /**
   * Fetch student's global learning statistics
   */
  getStudentLearningStats: async (studentId) => {
    // 1. Get enrollments summary
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('progress, status')
      .eq('student_id', studentId);

    const totalEnrolled = enrollments?.length || 0;
    const completedCount = enrollments?.filter(e => e.status === 'completed').length || 0;
    const avgProgress = totalEnrolled > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / totalEnrolled)
      : 0;

    // 2. Get profile for XP and Streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points, current_streak')
      .eq('id', studentId)
      .single();

    return {
      totalEnrolled,
      completedCount,
      avgProgress,
      xp: profile?.xp_points || 0,
      streak: profile?.current_streak || 0
    };
  },

  /**
   * Find the most recent/next lesson to resume for a student
   */
  getContinueLearning: async (studentId) => {
    // 1. Get last accessed lesson progress
    const { data: lastAccessed } = await supabase
      .from('lesson_progress')
      .select('*, lesson:lessons(*, course:courses(*))')
      .eq('student_id', studentId)
      .order('last_accessed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastAccessed) return lastAccessed;

    // 2. Fallback: Get first lesson of the most recently enrolled course
    const { data: recentEnrollment } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentEnrollment) {
      const { data: firstLesson } = await supabase
        .from('lessons')
        .select('*, course:courses(*)')
        .eq('course_id', recentEnrollment.course_id)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      return firstLesson ? { lesson: firstLesson } : null;
    }

    return null;
  },

  /**
   * Fetch full course content including modules and lessons
   * @param {string} courseId 
   */
  getCourseDetails: async (courseId) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id(full_name, avatar_url),
        modules:modules(
          *,
          lessons:lessons(*)
        )
      `)
      .eq('id', courseId)
      .order('order_index', { foreignTable: 'modules', ascending: true })
      .order('order_index', { foreignTable: 'modules.lessons', ascending: true })
      .maybeSingle();

    if (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }

    if (!data) return null;

    // Sort modules and lessons by order_index and ensure content_type fallback
    if (data.modules) {
      data.modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      data.modules.forEach(m => {
        if (m.lessons) {
          m.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          // Robustness: ensure content_type is always set
          m.lessons = m.lessons.map(l => ({
            ...l,
            content_type: (l.content_type === 'video' || (!l.content_type && l.content_url)) ? 'video' : 'reading'
          }));
        }
      });
    }

    return data;
  },

  /**
   * Update student progress in a course
   * @param {string} studentId 
   * @param {string} courseId 
   * @param {number} progressPercent 
   */
  updateProgress: async (studentId, courseId, progressPercent) => {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ 
        progress: progressPercent,
        status: progressPercent >= 100 ? 'completed' : 'active'
      })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Enroll a student in a course
   * @param {string} studentId 
   * @param {string} courseId 
   */
  enrollInCourse: async (studentId, courseId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId,
        progress: 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch assignments for a student's enrolled courses
   * @param {string} studentId 
   */
  getStudentAssignments: async (studentId) => {
    // 1. Get enrolled course IDs
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId);

    if (enrollError) throw enrollError;
    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map(e => e.course_id);

    // 2. Get assignments for those courses
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses(title)
      `)
      .in('course_id', courseIds)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch student submissions for assignments
   * @param {string} studentId 
   */
  getStudentSubmissions: async (studentId) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;
    return data || [];
  },


  /**
   * Fetch detailed chart data for the analytics dashboard
   */
  getDetailedAnalytics: async (studentId, courseId) => {
    // Fetch daily progress for the last 7 days
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('updated_at, completion_percentage')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('updated_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};

export default CourseService;
