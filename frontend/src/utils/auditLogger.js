import { supabase } from '../lib/supabase';

export const logAdminAction = async (action, details, previous_state = null, new_state = null) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const admin_id = session?.user?.id;

    if (!admin_id) return; // Silent return if not authenticated

    const { error } = await supabase.from('audit_logs').insert([{
      admin_id,
      action,
      details,
      previous_state,
      new_state
    }]);

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (err) {
    console.error('Audit logger error:', err);
  }
};
