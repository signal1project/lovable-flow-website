import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType } from '@/types/auth';
import { fetchProfile } from '@/utils/profileOperations';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to ensure profile and role-specific row exist
async function ensureProfileAndRoleRows(user: User) {
  try {
    // 1. Ensure profile row exists
    const { data: profile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (fetchProfileError) {
      throw fetchProfileError;
    }

    if (!profile) {
      const role = user.user_metadata?.role || 'lender'; // default to lender
      const country = user.user_metadata?.country || '';
      const full_name = user.user_metadata?.full_name || '';
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name,
        role,
        country,
      });
      if (insertError) {
        throw insertError;
      }
    }

    // 2. Ensure role-specific row exists
    const { data: newProfile, error: fetchNewProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (fetchNewProfileError) {
      throw fetchNewProfileError;
    }

    if (newProfile?.role === 'lender') {
      const { data: lender, error: fetchLenderError } = await supabase
        .from('lenders')
        .select('*')
        .eq('id', user.id)
        .single();
      if (fetchLenderError) {
        throw fetchLenderError;
      }
      if (!lender) {
        const { error: insertLenderError } = await supabase.from('lenders').insert({
          id: user.id,
          profile_id: user.id,
          profile_completed: false,
        });
        if (insertLenderError) {
          throw insertLenderError;
        }
      }
    } else if (newProfile?.role === 'broker') {
      const { data: broker, error: fetchBrokerError } = await supabase
        .from('brokers')
        .select('*')
        .eq('id', user.id)
        .single();
      if (fetchBrokerError) {
        throw fetchBrokerError;
      }
      if (!broker) {
        const { error: insertBrokerError } = await supabase.from('brokers').insert({
          id: user.id,
          profile_id: user.id,
          profile_completed: false,
        });
        if (insertBrokerError) {
          throw insertBrokerError;
        }
      }
    }
  } catch (err) {
    throw err;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { signIn, signUp, signInWithGoogle, signOut } = useAuthOperations();
  const navigate = useNavigate();

  useEffect(() => {
  }, [user, profile, loading]);

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await ensureProfileAndRoleRows(session.user);
          } catch (err) {
            console.error('Error in ensureProfileAndRoleRows:', err);
          }
          // Always fetch profile after ensuring it exists, retry up to 5 times
          let profileData = null;
          for (let i = 0; i < 5; i++) {
            profileData = await fetchProfile(session.user.id);
            if (profileData) break;
            await new Promise(res => setTimeout(res, 200));
          }
          if (!profileData) {
            console.error('[AuthProvider] Failed to fetch profile after retries for user:', session.user.id);
          }
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          navigate('/login', { replace: true });
        } else if (session?.user) {
          setUser(session.user);
          // Always fetch profile after user is set, retry up to 5 times
          (async () => {
            let profileData = null;
            for (let i = 0; i < 5; i++) {
              profileData = await fetchProfile(session.user.id);
              if (profileData) break;
              await new Promise(res => setTimeout(res, 200));
            }
            setProfile(profileData);
          })();
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
