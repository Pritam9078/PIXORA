import { supabase } from '../lib/supabase';

export const QuizService = {
  /**
   * Fetch quizzes for an instructor (safe two-step approach)
   */
  getInstructorQuizzes: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Step 1: Get instructor's courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', session.user.id);

      if (coursesError) {
        console.warn('Could not fetch courses for quiz lookup:', coursesError.message);
        return [];
      }

      if (!courses || courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);

      // Step 2: Fetch quizzes for those courses
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });

      if (error) {
        // Table may not exist yet — return empty array gracefully
        console.warn('Could not fetch quizzes (table may not exist yet):', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('QuizService.getInstructorQuizzes error:', error);
      return [];
    }
  },

  /**
   * Fetch quizzes for a student
   * @param {string} studentId 
   */
  getQuizzes: async (studentId) => {
    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', studentId);

      const courseIds = enrollments?.map(e => e.course_id) || [];
      if (courseIds.length === 0) return [];

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          course:courses(title),
          attempts:quiz_attempts(*)
        `)
        .in('course_id', courseIds);

      if (error) {
        // If join fails due to schema cache, try a fallback single fetch
        if (error.message?.includes('relationship')) {
           console.warn('PostgREST relationship lookup failed, using fallback fetch.');
           const { data: quizzes } = await supabase.from('quizzes').select('*, course:courses(title)').in('course_id', courseIds);
           const { data: attempts } = await supabase.from('quiz_attempts').select('*').eq('student_id', studentId);
           return (quizzes || []).map(q => ({
             ...q,
             myAttempts: (attempts || []).filter(a => a.quiz_id === q.id)
           }));
        }
        console.warn('Could not fetch student quizzes:', error.message);
        return [];
      }

      return (data || []).map(quiz => ({
        ...quiz,
        myAttempts: (quiz.attempts || []).filter(a => a.student_id === studentId)
      }));
    } catch (error) {
      console.error('QuizService.getQuizzes error:', error);
      return [];
    }
  },

  /**
   * Fetch questions for a specific quiz
   * @param {string} quizId 
   */
  getQuizQuestions: async (quizId) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('QuizService.getQuizQuestions error:', error);
      return [];
    }
  },

  /**
   * Submit a quiz attempt
   * @param {string} studentId 
   * @param {string} quizId 
   * @param {number} score 
   * @param {string} status 
   */
  submitQuizAttempt: async (studentId, quizId, score, status) => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        student_id: studentId,
        quiz_id: quizId,
        score,
        status,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity — ignore if audit_logs doesn't exist
    try {
      await supabase.from('audit_logs').insert({
        actor_id: studentId,
        action: 'QUIZ_COMPLETED',
        target_type: 'quiz',
        target_id: quizId,
        metadata: { score, status }
      });
    } catch (_) { /* non-critical */ }

    return data;
  }
};

export default QuizService;
