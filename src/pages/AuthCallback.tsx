import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        navigate('/login');
        return;
      }

      if (data.session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile && profile.role) {
          // Check if user has completed role-specific onboarding
          if (profile.role === 'lender') {
            const { data: lenderData } = await supabase
              .from('lenders')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            
            if (lenderData) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          } else if (profile.role === 'broker') {
            const { data: brokerData } = await supabase
              .from('brokers')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            
            if (brokerData) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
          }
        } else {
          navigate('/onboarding');
        }
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
    </div>
  );
};

export default AuthCallback;
