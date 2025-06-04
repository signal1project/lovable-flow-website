
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log('🔍 Fetching profile for user:', userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching profile:', error);
      console.error('🔍 Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    if (!data) {
      console.log('⚠️ No profile found for user:', userId);
      return null;
    }
    
    console.log('✅ Profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 Exception while fetching profile:', error);
    return null;
  }
};
