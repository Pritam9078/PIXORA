import { supabase } from '../lib/supabase';

export const LessonService = {
  /**
   * Fetch completed lessons for a student in a course
   * @param {string} studentId 
   * @param {string} courseId 
   */
  getCompletedLessons: async (studentId, courseId) => {
    // For now, we use a hybrid approach: try to get from enrollments metadata, 
    // fallback to localStorage if needed.
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('metadata')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    return enrollment?.metadata?.completed_lessons || [];
  },

  /**
   * Mark a lesson as completed
   * @param {string} studentId 
   * @param {string} courseId 
   * @param {string} lessonId 
   */
  markLessonComplete: async (studentId, courseId, lessonId) => {
    // 1. Get current metadata
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('metadata, progress')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    const currentLessons = enrollment?.metadata?.completed_lessons || [];
    
    if (currentLessons.includes(lessonId)) return enrollment;

    const newCompletedLessons = [...currentLessons, lessonId];

    // 2. Fetch total lesson count for this course to calculate progress
    const { count } = await supabase
      .from('course_content')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    const totalLessons = count || 1;
    const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);

    // 3. Update enrollment
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        metadata: { ...enrollment?.metadata, completed_lessons: newCompletedLessons },
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active'
      })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) throw error;

    // 4. Log activity
    await supabase.from('audit_logs').insert({
      actor_id: studentId,
      action: 'LESSON_COMPLETED',
      target_type: 'course_content',
      target_id: lessonId,
      metadata: { course_id: courseId, progress: newProgress }
    });

    return data;
  }
};
