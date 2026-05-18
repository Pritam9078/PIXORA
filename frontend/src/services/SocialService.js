import { supabase } from '../lib/supabase';

export const SocialService = {
  /**
   * Fetch leaderboard based on mode (global or track)
   * @param {string} mode - 'global' or 'track-only'
   * @param {string} studentId - current student id
   * @param {number} limit 
   */
  getLeaderboard: async (limit = 100, mode = 'global', studentId = null) => {
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, xp_points, learning_track, current_streak')
        .eq('role', 'student')
        .order('xp_points', { ascending: false })
        .limit(limit);

      if (mode === 'track-only' && studentId) {
        // First get student's track
        const { data: profile } = await supabase
          .from('profiles')
          .select('learning_track')
          .eq('id', studentId)
          .single();
        
        if (profile?.learning_track) {
          query = query.eq('learning_track', profile.learning_track);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error.message);
      return [];
    }
  },

  /**
   * Fetch global leaderboard rankings (Legacy support)
   * @param {number} limit 
   */
  getGlobalLeaderboard: async (limit = 100) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, xp_points, learning_track')
      .eq('role', 'student')
      .order('xp_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Fetch real-time activity feed
   */
  getActivityFeed: async (limit = 20) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        actor:profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to real-time activity feed
   * @param {function} callback 
   */
  subscribeToActivityFeed: (callback) => {
    return supabase
      .channel('public:audit_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, async (payload) => {
        // Fetch actor details for the new log
        const { data: actor } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', payload.new.actor_id)
          .single();
        
        callback({ ...payload.new, actor });
      })
      .subscribe();
  }
};

export default SocialService;
