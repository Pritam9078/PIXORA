import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseData = (table, query = '*') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(query);

      if (fetchError) throw fetchError;
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}_realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        console.log('Real-time update:', payload);
        fetchData(); // Simplest way to ensure consistency, or optimize by updating state
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, query]);

  return { data, loading, error, refresh: fetchData };
};
