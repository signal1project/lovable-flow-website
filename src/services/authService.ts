
import { supabase } from '@/integrations/supabase/client';

export const signIn = async (email: string, password: string) => {
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

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    console.log('🚀 Signing up with metadata:', userData);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      console.error('❌ Sign up error:', error);
    } else {
      console.log('✅ Sign up successful');
    }
    
    return { error };
  } catch (error) {
    console.error('💥 Sign up exception:', error);
    return { error };
  }
};

export const signInWithGoogle = async () => {
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

export const signOut = async () => {
  try {
    console.log('👋 Signing out user...');
    await supabase.auth.signOut();
    window.location.href = '/';
  } catch (error) {
    console.error('❌ Error signing out:', error);
    window.location.href = '/';
  }
};
