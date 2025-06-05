
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/auth';
import { createProfile } from '@/utils/profileOperations';

export const useAuthOperations = () => {
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

  const signUp = async (email: string, password: string, userData: UserData) => {
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

      if (data.user && !data.user.email_confirmed_at) {
        console.log('📧 User needs email confirmation');
      } else if (data.user) {
        console.log('🔄 Creating profile immediately...');
        try {
          await createProfile(data.user, userData);
        } catch (profileError) {
          console.error('❌ Profile creation failed during signup:', profileError);
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

  return {
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
};
