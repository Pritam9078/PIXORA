import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Simple validation to ensure the URL starts with http:// or https://
const isValidUrl = (url) => {
  if (!url || url.includes('your_supabase_url_here')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isConfigured = supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your_supabase_anon_key_here');

// Mock implementation for development without real credentials
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: { user_metadata: { role: 'student' } } }, error: null }),
    signUp: () => Promise.resolve({ data: { user: { user_metadata: { role: 'student' } } }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  }
};

if (!isConfigured) {
  console.warn(
    'PIXORA_NOTICE: Using Mock Auth mode. Authentication features are simulated.\n' +
    'To enable real Supabase auth, update your .env file with valid credentials.'
  );
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabase;


