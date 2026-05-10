import { supabase } from '../lib/supabase';

export const SubmissionService = {
  /**
   * Fetch assignments for a student
   * @param {string} studentId 
   */
  getAssignments: async (studentId) => {
    // 1. Get courses student is enrolled in
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId);

    const courseIds = enrollments?.map(e => e.course_id) || [];

    if (courseIds.length === 0) return [];

    // 2. Fetch assignments for these courses
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses(title),
        submissions:submissions(*)
      `)
      .in('course_id', courseIds);

    if (error) throw error;

    // Filter submissions for the current student
    return data.map(assignment => ({
      ...assignment,
      mySubmission: assignment.submissions?.find(s => s.student_id === studentId) || null
    }));
  },

  /**
   * Submit an assignment
   * @param {string} studentId 
   * @param {string} assignmentId 
   * @param {File} file 
   */
  submitAssignment: async (studentId, assignmentId, file) => {
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${studentId}_${Date.now()}.${fileExt}`;
      const filePath = `assignments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-assets')
        .getPublicUrl(filePath);

      // 2. Create or update submission record
      const { data, error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          submission_url: publicUrl,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Log activity
      await supabase.from('audit_logs').insert({
        actor_id: studentId,
        action: 'ASSIGNMENT_SUBMITTED',
        target_type: 'assignment',
        target_id: assignmentId,
        metadata: { file_url: publicUrl }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error submitting assignment:', error.message);
      return { success: false, error: error.message };
    }
  }
};
