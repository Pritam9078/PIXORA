import { supabase } from '../lib/supabase';

export const AssignmentService = {
  /**
   * Fetch assignments for a course
   */
  getCourseAssignments: async (courseId) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Submit an assignment
   */
  submitAssignment: async (studentId, assignmentId, submissionData) => {
    const { data, error } = await supabase
      .from('submissions')
      .upsert({
        student_id: studentId,
        assignment_id: assignmentId,
        ...submissionData,
        submitted_at: new Date().toISOString(),
        status: 'pending'
      }, { onConflict: 'student_id, assignment_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get student's submission for a specific assignment
   */
  getStudentSubmission: async (studentId, assignmentId) => {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, grade:grades(*)')
      .eq('student_id', studentId)
      .eq('assignment_id', assignmentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  }
};

export default AssignmentService;
