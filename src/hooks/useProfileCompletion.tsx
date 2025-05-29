
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking lender profile:', error);
            setIsComplete(false);
          } else {
            setIsComplete(!!data && !!data.company_name && !!data.specialization);
          }
        } else if (profile.role === 'broker') {
          const { data, error } = await supabase
            .from('brokers')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking broker profile:', error);
            setIsComplete(false);
          } else {
            setIsComplete(!!data && !!data.agency_name);
          }
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setIsComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, profile]);

  return { isComplete, loading };
};
