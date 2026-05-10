import { supabase } from '../lib/supabase';

export const ProfileService = {
  /**
   * Update student profile information
   * @param {string} userId 
   * @param {object} updates 
   */
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload and update student avatar
   * @param {string} userId 
   * @param {File} file 
   */
  uploadAvatar: async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload image to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  }
};
