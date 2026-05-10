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
   * Fetch courses the student is enrolled in
   * @param {string} studentId 
   */
  getEnrolledCourses: async (studentId) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          *,
          instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url)
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;
    return data;
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
      .single();

    if (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }

    // Sort modules and lessons by order_index
    if (data.modules) {
      data.modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      data.modules.forEach(m => {
        if (m.lessons) {
          m.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
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
  }
};

export default CourseService;
