import { supabase } from '../lib/supabase';

export const LessonService = {
  /**
   * Fetch detailed progress for all lessons in a course for a student
   */
  getCourseProgress: async (studentId, courseId) => {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Update watch progress for a lesson
   */
  updateWatchProgress: async (studentId, courseId, lessonId, timestamp, percentage) => {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: studentId,
        course_id: courseId,
        lesson_id: lessonId,
        last_timestamp: timestamp,
        completion_percentage: Math.max(0, Math.min(100, percentage)),
        status: percentage >= 90 ? 'completed' : 'in_progress', // Auto-complete at 90%
        last_accessed_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;
    
    // If marked as completed, update the overall enrollment progress
    if (percentage >= 90) {
      await LessonService.syncOverallProgress(studentId, courseId);
    }

    return data;
  },

  /**
   * Manually mark a lesson as completed
   */
  markLessonComplete: async (studentId, courseId, lessonId) => {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: studentId,
        course_id: courseId,
        lesson_id: lessonId,
        status: 'completed',
        completion_percentage: 100,
        last_accessed_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;

    await LessonService.syncOverallProgress(studentId, courseId);
    return data;
  },

  /**
   * Sync overall course progress in enrollments table
   */
  syncOverallProgress: async (studentId, courseId) => {
    // 1. Count total lessons
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // 2. Count completed lessons from lesson_progress
    const { count: completedLessons } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('status', 'completed');

    const progress = Math.round(((completedLessons || 0) / (totalLessons || 1)) * 100);

    // 3. Update enrollment
    await supabase
      .from('enrollments')
      .update({ 
        progress,
        status: progress >= 100 ? 'completed' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    // 4. Update XP in profile if newly completed? (Optional logic here)
  },

  /**
   * Generic update for lesson progress (e.g., last_accessed_at, notes)
   */
  updateLessonProgress: async (studentId, courseId, lessonId, updates) => {
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id: studentId,
        course_id: courseId,
        lesson_id: lessonId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
