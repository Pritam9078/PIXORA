import { supabase } from '../lib/supabase';

export const NoteService = {
  /**
   * Fetch notes for a specific lesson
   */
  getLessonNotes: async (studentId, lessonId) => {
    try {
      const { data, error } = await supabase
        .from('learning_notes')
        .select('*')
        .eq('student_id', studentId)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) return []; // table may not exist yet
      return data || [];
    } catch (_) {
      return [];
    }
  },

  /**
   * Save or update a note for a lesson
   */
  saveNote: async (studentId, courseId, lessonId, content) => {
    const { data, error } = await supabase
      .from('learning_notes')
      .upsert({
        student_id: studentId,
        course_id: courseId,
        lesson_id: lessonId,
        content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id, lesson_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all notes for a specific course
   */
  getCourseNotes: async (studentId, courseId) => {
    try {
      const { data, error } = await supabase
        .from('learning_notes')
        .select(`
          *,
          lesson:lessons(title)
        `)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) return []; // table may not exist yet
      return data || [];
    } catch (_) {
      return [];
    }
  },

  /**
   * Delete a note
   */
  deleteNote: async (noteId) => {
    const { error } = await supabase
      .from('learning_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    return true;
  }
};
