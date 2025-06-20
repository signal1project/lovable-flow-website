import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType } from '@/types/auth';
import { fetchProfile } from '@/utils/profileOperations';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add at the top for consistent debug prefix
const DEBUG = '[AuthProvider]';

// Helper to ensure profile and role-specific row exist
async function ensureProfileAndRoleRows(user: User) {
  console.log(DEBUG + ' ensureProfileAndRoleRows called', user);
  try {
    // 1. Ensure profile row exists
    console.log(DEBUG + ' fetching profile row...');
    const { data: profile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    console.log(DEBUG + ' fetched profile row:', { data: profile, error: fetchProfileError });
    if (fetchProfileError) {
      console.error(DEBUG + 'Error fetching profile in ensureProfileAndRoleRows:', fetchProfileError);
    }

    if (!profile) {
      const role = user.user_metadata?.role || 'lender'; // default to lender
      const country = user.user_metadata?.country || '';
      const full_name = user.user_metadata?.full_name || '';
      console.log(DEBUG + ' inserting profile row...');
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name,
        role,
        country,
      });
      console.log(DEBUG + ' inserted profile row:', { error: insertError });
      if (insertError) {
        console.error(DEBUG + 'Error inserting profile:', insertError);
      } else {
        console.log(DEBUG + 'Inserted new profile for user:', user.id);
      }
    }

    // 2. Ensure role-specific row exists
    console.log(DEBUG + ' fetching new profile row...');
    const { data: newProfile, error: fetchNewProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    console.log(DEBUG + ' fetched new profile row:', { data: newProfile, error: fetchNewProfileError });
    if (fetchNewProfileError) {
      console.error(DEBUG + 'Error fetching new profile in ensureProfileAndRoleRows:', fetchNewProfileError);
    }

    if (newProfile?.role === 'lender') {
      console.log(DEBUG + ' fetching lender row...');
      const { data: lender, error: fetchLenderError } = await supabase
        .from('lenders')
        .select('*')
        .eq('id', user.id)
        .single();
      console.log(DEBUG + ' fetched lender row:', { data: lender, error: fetchLenderError });
      if (fetchLenderError) {
        console.error(DEBUG + 'Error fetching lender in ensureProfileAndRoleRows:', fetchLenderError);
      }
      if (!lender) {
        console.log(DEBUG + ' inserting lender row...');
        const { error: insertLenderError } = await supabase.from('lenders').insert({
          id: user.id,
          profile_id: user.id,
          profile_completed: false,
        });
        console.log(DEBUG + ' inserted lender row:', { error: insertLenderError });
        if (insertLenderError) {
          console.error(DEBUG + 'Error inserting lender:', insertLenderError);
        } else {
          console.log(DEBUG + 'Inserted new lender for user:', user.id);
        }
      }
    } else if (newProfile?.role === 'broker') {
      console.log(DEBUG + ' fetching broker row...');
      const { data: broker, error: fetchBrokerError } = await supabase
        .from('brokers')
        .select('*')
        .eq('id', user.id)
        .single();
      console.log(DEBUG + ' fetched broker row:', { data: broker, error: fetchBrokerError });
      if (fetchBrokerError) {
        console.error(DEBUG + 'Error fetching broker in ensureProfileAndRoleRows:', fetchBrokerError);
      }
      if (!broker) {
        console.log(DEBUG + ' inserting broker row...');
        const { error: insertBrokerError } = await supabase.from('brokers').insert({
          id: user.id,
          profile_id: user.id,
          profile_completed: false,
        });
        console.log(DEBUG + ' inserted broker row:', { error: insertBrokerError });
        if (insertBrokerError) {
          console.error(DEBUG + 'Error inserting broker:', insertBrokerError);
        } else {
          console.log(DEBUG + 'Inserted new broker for user:', user.id);
        }
      }
    }
    console.log(DEBUG + ' ensureProfileAndRoleRows completed');
  } catch (err) {
    console.error(DEBUG + ' Error inside ensureProfileAndRoleRows:', err);
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
    console.log(DEBUG + 'user:', user, 'profile:', profile, 'loading:', loading);
  }, [user, profile, loading]);

  const refreshProfile = async () => {
    if (user) {
      console.log(DEBUG + 'refreshProfile for user:', user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      console.log(DEBUG + 'setProfile (refreshProfile):', profileData);
    }
  };

  useEffect(() => {
    console.log(DEBUG + ' useEffect (getSession) running');
    const getSession = async () => {
      console.log(DEBUG + ' getSession function running');
      console.log(DEBUG + '🔄 Getting initial session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log(DEBUG + '📋 Initial session:', session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await ensureProfileAndRoleRows(session.user);
            console.log(DEBUG + ' ensureProfileAndRoleRows finished in getSession');
          } catch (err) {
            console.error(DEBUG + ' Error in ensureProfileAndRoleRows:', err);
          }
          // Always fetch profile after ensuring it exists, retry up to 5 times
          let profileData = null;
          for (let i = 0; i < 5; i++) {
            console.log(DEBUG + ' calling fetchProfile from getSession', session.user.id);
            profileData = await fetchProfile(session.user.id);
            if (profileData) break;
            await new Promise(res => setTimeout(res, 200));
          }
          if (!profileData) {
            console.error(DEBUG + '[AuthProvider] Failed to fetch profile after retries for user:', session.user.id);
          }
          setProfile(profileData);
          console.log(DEBUG + 'setProfile (getSession):', profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(DEBUG + '❌ Error getting session:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(DEBUG + ' onAuthStateChange handler running', event, session);
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
              console.log(DEBUG + ' calling fetchProfile from onAuthStateChange', session.user.id);
              profileData = await fetchProfile(session.user.id);
              if (profileData) break;
              await new Promise(res => setTimeout(res, 200));
            }
            setProfile(profileData);
            console.log(DEBUG + 'setProfile (onAuthStateChange):', profileData);
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
