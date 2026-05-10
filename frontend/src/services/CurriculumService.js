import { supabase } from '../lib/supabase';

export const CurriculumService = {
  // Fetch full curriculum hierarchy (modules and lessons) for a course
  async getCurriculum(courseId) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        // we might also want to order lessons within modules if possible,
        // but often handled client side if Supabase ordering on joined tables is tricky
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching curriculum:", error);
      throw error;
    }
  },

  // Save/update modules in batch (e.g., from drag-and-drop)
  async saveModules(modules) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .upsert(modules, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving modules:", error);
      throw error;
    }
  },

  // Save/update lessons
  async saveLessons(lessons) {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .upsert(lessons, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving lessons:", error);
      throw error;
    }
  },

  async deleteModule(moduleId) {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      throw error;
    }
  },

  async deleteLesson(lessonId) {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      throw error;
    }
  }
};
