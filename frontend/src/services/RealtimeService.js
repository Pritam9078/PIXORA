import { supabase } from '../lib/supabase';

/**
 * RealtimeService: Handles all live subscriptions for the Student Dashboard.
 * Ensures that changes made by instructors (new lessons, assignments, etc.)
 * reflect instantly on the student side.
 */
export const RealtimeService = {
  /**
   * Subscribe to curriculum changes for a specific course
   */
  subscribeToCurriculum: (courseId, callback) => {
    return supabase
      .channel(`curriculum-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'modules',
          filter: `course_id=eq.${courseId}`
        },
        payload => callback({ type: 'module', ...payload })
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `course_id=eq.${courseId}`
        },
        payload => callback({ type: 'lesson', ...payload })
      )
      .subscribe();
  },

  /**
   * Subscribe to announcements for a course
   */
  subscribeToAnnouncements: (courseId, callback) => {
    return supabase
      .channel(`announcements-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_announcements',
          filter: `course_id=eq.${courseId}`
        },
        payload => callback(payload.new)
      )
      .subscribe();
  },

  /**
   * Subscribe to assignment and quiz updates
   */
  subscribeToAssessments: (courseId, callback) => {
    return supabase
      .channel(`assessments-${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `course_id=eq.${courseId}`
        },
        payload => callback({ type: 'assignment', ...payload })
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quizzes',
          filter: `course_id=eq.${courseId}`
        },
        payload => callback({ type: 'quiz', ...payload })
      )
      .subscribe();
  },

  /**
   * Subscribe to progress updates for a student
   */
  subscribeToProgress: (studentId, callback) => {
    return supabase
      .channel(`progress-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `student_id=eq.${studentId}`
        },
        payload => callback(payload)
      )
      .subscribe();
  },

  /**
   * Clean up a specific subscription
   */
  unsubscribe: (channel) => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
