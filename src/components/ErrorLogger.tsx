
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ErrorLogger = () => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Log auth state for debugging
    if (!loading) {
      console.log('=== AUTH STATE DEBUG ===');
      console.log('User:', user);
      console.log('Profile:', profile);
      console.log('Loading:', loading);
      console.log('Current route:', window.location.pathname);
      console.log('========================');
    }
  }, [user, profile, loading]);

  return null;
};

export default ErrorLogger;
