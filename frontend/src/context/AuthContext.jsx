import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      console.log('fetchProfile: Starting fetch for:', userId);
      
      // Safety timeout: Don't wait more than 5 seconds for the profile
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('fetchProfile: Result received:', { hasData: !!data, error: error?.message, code: error?.code });
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.error("Profile not found. User might be new.");
        } else if (error.code === '42P01') {
          console.error("CRITICAL: 'profiles' table missing!");
        } else {
          console.error("Error fetching profile:", error.message);
        }
        setProfile(null);
        return;
      }
      
      setProfile(data);
    } catch (err) {
      console.error("Unexpected error or timeout fetching profile:", err.message);
      setProfile(null);
    } finally {
      console.log('fetchProfile: Finished');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('AuthContext: Fetching session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        console.log('AuthContext: Session fetched:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthContext: Initiating profile fetch for user:', session.user.id);
          // Don't strictly await here if we want to show the app faster, 
          // but we usually need the profile for routing.
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.warn('AuthContext: Supabase session check failed', err);
      } finally {
        console.log('AuthContext: Setting loading to false (getSession)');
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      console.log('AuthContext: Setting loading to false (onAuthStateChange)');
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    },
    user,
    session,
    profile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-[#0D0E12] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#c3f400] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
