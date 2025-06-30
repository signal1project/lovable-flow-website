import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCompletionStatus {
  isComplete: boolean;
  loading: boolean;
}

export const useProfileCompletion = (): ProfileCompletionStatus => {
  const { user, profile } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }

      try {
        if (profile.role === 'lender') {
          const { data, error } = await supabase
            .from('lenders')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            setIsComplete(false);
          } else {
            // Check both profile_completed flag and required fields
            setIsComplete(!!data && data.profile_completed === true && !!data.company_name && !!data.specialization);
          }
        } else if (profile.role === 'broker') {
          const { data, error } = await supabase
            .from('brokers')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') {
            setIsComplete(false);
          } else {
            // Check both profile_completed flag and required fields
            setIsComplete(!!data && data.profile_completed === true && !!data.agency_name);
          }
        } else if (profile.role === 'admin') {
          // Admins don't need additional profile completion
          setIsComplete(true);
        }
      } catch (error) {
        setIsComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, profile]);

  return { isComplete, loading };
};
