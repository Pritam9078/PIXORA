import { supabase } from '../lib/supabase';

export const GamificationService = {
  /**
   * Award XP to a student
   * @param {string} studentId 
   * @param {number} amount 
   * @param {string} reason 
   */
  awardXP: async (studentId, amount, reason) => {
    try {
      // 1. Get current XP
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp_points')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      const newXP = (profile.xp_points || 0) + amount;

      // 2. Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp_points: newXP })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // 3. Log the XP gain
      await supabase.from('audit_logs').insert({
        actor_id: studentId,
        action: 'XP_AWARDED',
        target_type: 'profile',
        target_id: studentId,
        metadata: { amount, reason, total_xp: newXP }
      });

      return { success: true, newXP };
    } catch (error) {
      console.error('Error awarding XP:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update student streak
   * Should be called on daily login or activity
   * @param {string} studentId 
   */
  updateStreak: async (studentId) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_streak, last_activity_at')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      const now = new Date();
      const lastActivity = profile.last_activity_at ? new Date(profile.last_activity_at) : null;
      
      let newStreak = profile.current_streak || 0;

      if (!lastActivity) {
        newStreak = 1;
      } else {
        const diffInHours = (now - lastActivity) / (1000 * 60 * 60);
        
        if (diffInHours < 24 && now.getDate() !== lastActivity.getDate()) {
          // New day, within 24h
          newStreak += 1;
        } else if (diffInHours >= 48) {
          // Missed more than a day, reset streak
          newStreak = 1;
        }
        // If diff < 24 and same day, streak stays same
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          current_streak: newStreak,
          last_activity_at: now.toISOString()
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      return { success: true, newStreak };
    } catch (error) {
      console.error('Error updating streak:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check and award achievements
   * @param {string} studentId 
   */
  checkAchievements: async (studentId) => {
    // This would contain logic to check for specific milestones
    // e.g. "Completed first course", "10 day streak", etc.
    console.log('Checking achievements for student:', studentId);
  }
};

export default GamificationService;
