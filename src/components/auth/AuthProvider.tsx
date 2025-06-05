
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  role: string;
  country: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Fetching profile for user:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        setProfile(null);
        return;
      }

      if (!data) {
        console.log('⚠️ No profile found for user:', userId);
        setProfile(null);
        return;
      }
      
      console.log('✅ Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('💥 Exception while fetching profile:', error);
      setProfile(null);
    }
  };

  const createProfile = async (user: User, userData: any) => {
    console.log('🚀 Creating profile for user:', user.id, 'with data:', userData);
    
    try {
      const profileData = {
        id: user.id, // This matches auth.uid()
        full_name: userData.full_name,
        role: userData.role,
        country: userData.country,
        email: user.email,
      };

      console.log('📝 Profile data to create:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation failed:', error);
        throw error;
      }

      console.log('✅ Profile created successfully:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('💥 Exception creating profile:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      console.log('🔄 Getting initial session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session:', session);
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'no user');
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Small delay to allow any triggers to complete
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 500);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('💥 Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('🚀 Signing up with metadata:', userData);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('❌ Sign up error:', error);
        return { error };
      }

      console.log('✅ Sign up successful, user:', data.user);

      // If user is created and confirmed, create profile immediately
      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 User needs email confirmation');
      } else if (data.user) {
        console.log('🔄 Creating profile immediately...');
        try {
          await createProfile(data.user, userData);
        } catch (profileError) {
          console.error('❌ Profile creation failed during signup:', profileError);
          // Don't return error here as user was created successfully
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('💥 Sign up exception:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out user...');
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Error signing out:', error);
      window.location.href = '/';
    }
  };

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
