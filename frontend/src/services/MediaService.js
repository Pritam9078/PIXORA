import { supabase } from '../lib/supabase';

export const MediaService = {
  // Fetch media library items for instructor
  async getMediaLibrary() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('media_library')
        .select(`
          *,
          media_tags(tag)
        `)
        .eq('instructor_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching media library:", error);
      throw error;
    }
  },

  // Upload file to storage and record in database
  async uploadMedia(file, fileType, folder = 'root') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const instructorId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${instructorId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // 1. Upload to Supabase Storage (bucket: 'instructor_media')
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('instructor_media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('instructor_media')
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData.publicUrl;

      // 2. Record in media_library table
      const { data: dbData, error: dbError } = await supabase
        .from('media_library')
        .insert([{
          instructor_id: instructorId,
          file_name: file.name,
          file_url: fileUrl,
          file_type: fileType,
          size_bytes: file.size,
          folder: folder
        }])
        .select()
        .single();

      if (dbError) {
        // Rollback storage if db insert fails
        await supabase.storage.from('instructor_media').remove([fileName]);
        throw dbError;
      }

      return dbData;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  },

  async deleteMedia(mediaId, fileUrl) {
    try {
      // Extract file path from URL (naive approach, may need refinement based on exact URL structure)
      const urlParts = fileUrl.split('/instructor_media/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        // Delete from storage
        await supabase.storage.from('instructor_media').remove([filePath]);
      }

      // Delete from DB
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting media:", error);
      throw error;
    }
  }
};
