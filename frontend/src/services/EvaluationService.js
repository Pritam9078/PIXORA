import { supabase } from '../lib/supabase';

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');
  return session;
}

export const EvaluationService = {

  // ── Get all assignments for instructor's courses ───────────
  async getAssignmentsForInstructor() {
    try {
      const session = await getSession();

      // Step 1: Get instructor course IDs
      const { data: courses, error: cErr } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', session.user.id);

      if (cErr || !courses || courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);
      const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));

      // Step 2: Get assignments for those courses
      const { data: assignments, error: aErr } = await supabase
        .from('assignments')
        .select('*')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });

      if (aErr) { console.warn('assignments error:', aErr.message); return []; }

      // Step 3: Count submissions per assignment
      const assignmentIds = (assignments || []).map(a => a.id);
      let submissionCounts = {};
      let pendingCounts = {};

      if (assignmentIds.length > 0) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('assignment_id, grade')
          .in('assignment_id', assignmentIds);

        (subs || []).forEach(s => {
          submissionCounts[s.assignment_id] = (submissionCounts[s.assignment_id] || 0) + 1;
          if (s.grade === null || s.grade === undefined) {
            pendingCounts[s.assignment_id] = (pendingCounts[s.assignment_id] || 0) + 1;
          }
        });
      }

      return (assignments || []).map(a => ({
        ...a,
        courseName: courseMap[a.course_id] || 'Unknown',
        submissionsCount: submissionCounts[a.id] || 0,
        pendingCount: pendingCounts[a.id] || 0,
      }));
    } catch (error) {
      console.error('getAssignmentsForInstructor error:', error.message);
      return [];
    }
  },

  // ── Create assignment ─────────────────────────────────────
  async createAssignment(data) {
    const { data: result, error } = await supabase
      .from('assignments')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  // ── Get submissions for an assignment ─────────────────────
  async getSubmissionsForAssignment(assignmentId) {
    try {
      const { data: submissions, error: sErr } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (sErr) { console.warn('submissions error:', sErr.message); return []; }
      if (!submissions || submissions.length === 0) return [];

      const studentIds = [...new Set(submissions.map(s => s.student_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', studentIds);

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      return submissions.map(s => ({
        ...s,
        studentName: profileMap[s.student_id]?.full_name || 'Unknown',
        studentEmail: profileMap[s.student_id]?.email || '',
        studentAvatar: profileMap[s.student_id]?.avatar_url,
      }));
    } catch (error) {
      console.error('getSubmissionsForAssignment error:', error.message);
      return [];
    }
  },

  // ── Grade a submission ────────────────────────────────────
  async gradeSubmission(submissionId, grade, feedback) {
    const { data, error } = await supabase
      .from('submissions')
      .update({ grade, feedback, status: 'graded' })
      .eq('id', submissionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── Real-time subscription for submissions ────────────────
  subscribeToSubmissions(callback) {
    return supabase
      .channel('submissions:all')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, callback)
      .subscribe();
  },
};
