import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(null);
  const initializedRef = useRef(false);

  const fetchProfile = async (userId, userObject = null) => {
    if (!userId) return null;
    if (fetchingRef.current === userId && profile) return profile;
    
    fetchingRef.current = userId;
    console.log(`fetchProfile: Fetching profile for ${userId}`);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('fetchProfile: Profile found:', data.role);
        setProfile(data);
        fetchingRef.current = null;
        return data;
      }
      throw new Error('Profile not found');
    } catch (err) {
      console.warn('fetchProfile: Fetch failed, using metadata fallback:', err.message);
      
      const currentUser = userObject || (await supabase.auth.getUser()).data.user;
      
      if (currentUser) {
        const fallback = {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.user_metadata?.role || 'student',
          full_name: currentUser.user_metadata?.full_name || 'User',
          is_temp: true
        };
        setProfile(fallback);
        fetchingRef.current = null;
        return fallback;
      }
      
      setProfile(null);
      fetchingRef.current = null;
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      
      console.log('AuthContext: Initializing sequence...');
      
      // Global safety timeout - force loading to false after 5s
      const globalTimeout = setTimeout(() => {
        setLoading(prev => {
          if (prev) {
            console.warn('AuthContext: GLOBAL initialization timeout reached. Forcing loading false.');
            return false;
          }
          return prev;
        });
      }, 5000);

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(initialSession);
          const currentUser = initialSession?.user ?? null;
          setUser(currentUser);
          
          if (currentUser) {
            console.log('AuthContext: Found session, fetching profile...');
            // Don't await here to avoid blocking initialization
            fetchProfile(currentUser.id, currentUser);
          }
        }
      } catch (err) {
        console.warn('AuthContext: Initialization error', err);
      } finally {
        clearTimeout(globalTimeout);
        if (mounted) {
          setLoading(false);
          console.log('AuthContext: Initialization complete');
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`AuthContext: Auth event [${event}]`);
      
      if (!mounted) return;
      
      const currentUser = currentSession?.user ?? null;
      const prevUserId = user?.id;
      
      setSession(currentSession);
      setUser(currentUser);
      
      if (currentUser) {
        if (currentUser.id !== prevUserId || !profile) {
          // If we're already loading, initAuth will handle it. 
          // Otherwise, fetch it.
          fetchProfile(currentUser.id, currentUser);
        }
      } else {
        setProfile(null);
        fetchingRef.current = null;
      }
      
      // Ensure loading is false after auth event
      setLoading(false);
    });



    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Only run once on mount

  // 2. Real-time profile subscription (Dependent on user.id)
  useEffect(() => {
    let profileSubscription = null;
    
    if (user?.id) {
      profileSubscription = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('AuthContext: Profile updated in real-time:', payload.new);
          setProfile(payload.new);
        })
        .subscribe();
    }

    return () => {
      if (profileSubscription) profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  const value = useMemo(() => ({
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
  }), [user, session, profile, loading]);

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

