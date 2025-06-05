
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserData } from '@/types/auth';

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

export const createProfile = async (user: any, userData: UserData): Promise<Profile> => {
  console.log('🚀 Creating profile for user:', user.id, 'with data:', userData);
  
  try {
    const profileData = {
      id: user.id,
      full_name: userData.full_name,
      role: userData.role,
      country: userData.country,
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
    return data;
  } catch (error) {
    console.error('💥 Exception creating profile:', error);
    throw error;
  }
};
