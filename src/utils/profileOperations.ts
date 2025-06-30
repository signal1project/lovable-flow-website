import { supabase } from '@/integrations/supabase/client';
import { Profile, UserData } from '@/types/auth';

const DEBUG = '[profileOperations]';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return null;
    }

    if (!data) {
      return null;
    }
    
    return data;
  } catch (error) {
    return null;
  }
};

export const createProfile = async (user: any, userData: UserData): Promise<Profile> => {
  try {
    const profileData = {
      id: user.id,
      full_name: userData.full_name,
      role: userData.role,
      country: userData.country,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
