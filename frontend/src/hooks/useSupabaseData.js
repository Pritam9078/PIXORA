import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useSupabaseData = (table, query = '*') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(query)
        .abortSignal(controller.signal);

      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err.name === 'AbortError' ? 'Request timed out' : err.message);
      // Keep previous data or set to empty array
      if (!data.length) setData([]);
    } finally {
      clearTimeout(timeoutId);
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
