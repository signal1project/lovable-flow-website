import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ErrorLogger = () => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // All debug and state logs removed.
  }, [user, profile, loading]);

  return null;
};

export default ErrorLogger;
