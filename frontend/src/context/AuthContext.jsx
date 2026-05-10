import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(null);

  const fetchProfile = async (userId, attempt = 1) => {
    if (!userId) return null;
    
    // Prevent multiple simultaneous fetches for the same user
    if (fetchingRef.current === userId && attempt === 1) {
      console.log('fetchProfile: Already fetching for this user, skipping.');
      return null;
    }
    fetchingRef.current = userId;

    console.log(`fetchProfile: Starting fetch (attempt ${attempt}) for: ${userId}`);
    
    // Faster safety timeout promise (3s for first attempt, 5s for second)
    const timeoutMs = attempt === 1 ? 3000 : 5000;
    const timeout = (ms) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), ms)
    );

    try {
      // Race the supabase query
      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId),
        timeout(timeoutMs)
      ]);

      if (error) throw error;
      
      const profileData = data?.[0];
      if (profileData) {
        console.log('fetchProfile: Successfully fetched profile:', profileData.role);
        setProfile(profileData);
        fetchingRef.current = null;
        return profileData;
      } else {
        throw new Error('Profile not found');
      }
    } catch (err) {
      console.warn(`fetchProfile: Attempt ${attempt} failed:`, err.message);
      
      // If first attempt failed, try to use metadata IMMEDIATELY as a temporary state
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && !profile) {
        const tempProfile = {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.user_metadata?.role || 'student',
          full_name: currentUser.user_metadata?.full_name || 'User',
          is_temp: true
        };
        console.log('fetchProfile: Setting temporary profile from metadata');
        setProfile(tempProfile);
      }

      if (attempt < 2) {
        console.log('fetchProfile: Retrying for final attempt...');
        return fetchProfile(userId, attempt + 1);
      }

      // Final Fallback
      if (currentUser) {
        const finalFallback = {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.user_metadata?.role || 'student',
          full_name: currentUser.user_metadata?.full_name || 'User'
        };
        setProfile(finalFallback);
        fetchingRef.current = null;
        return finalFallback;
      }

      fetchingRef.current = null;
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('AuthContext: Initializing sequence...');
      
      // Global safety timeout - force loading to false after 7s
      const globalTimeout = setTimeout(() => {
        if (mounted && loading) {
          console.warn('AuthContext: GLOBAL initialization timeout reached. Forcing loading false.');
          setLoading(false);
        }
      }, 7000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('AuthContext: Found session, awaiting profile...');
            await fetchProfile(session.user.id);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AuthContext: Auth event [${event}]`);
      
      if (!mounted) return;
      
      const prevUserId = user?.id;
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (session.user.id !== prevUserId || !profile) {
          // If we're already loading, initAuth will handle it. 
          // Otherwise, fetch it.
          if (!loading) {
            fetchProfile(session.user.id);
          }
        }
      } else {
        setProfile(null);
        fetchingRef.current = null;
      }
      
      if (loading) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [user?.id, profile === null]);

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
