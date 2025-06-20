import { supabase } from '@/integrations/supabase/client';
import { Profile, UserData } from '@/types/auth';

const DEBUG = '[profileOperations]';

export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`${DEBUG} fetchProfile called`, userId);
  console.log(`${DEBUG} 🔍 Fetching profile for user:`, userId);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error(`${DEBUG} ❌ Error fetching profile:`, error);
      return null;
    }

    if (!data) {
      console.log(`${DEBUG} ⚠️ No profile found for user:`, userId);
      return null;
    }
    
    console.log(`${DEBUG} ✅ Profile fetched successfully:`, data);
    return data;
  } catch (error) {
    console.error(`${DEBUG} 💥 Exception while fetching profile:`, error);
    return null;
  }
};

export const createProfile = async (user: any, userData: UserData): Promise<Profile> => {
  console.log(`${DEBUG} 🚀 Creating profile for user:`, user.id, 'with data:', userData);
  
  try {
    const profileData = {
      id: user.id,
      full_name: userData.full_name,
      role: userData.role,
      country: userData.country,
    };

    console.log(`${DEBUG} 📝 Profile data to create:`, profileData);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error(`${DEBUG} ❌ Profile creation failed:`, error);
      throw error;
    }

    console.log(`${DEBUG} ✅ Profile created successfully:`, data);
    return data;
  } catch (error) {
    console.error(`${DEBUG} 💥 Exception creating profile:`, error);
    throw error;
  }
};
