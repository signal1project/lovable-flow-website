
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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

  // Show debug info in development
  if (process.env.NODE_ENV === 'development' && !loading) {
    const hasAuthIssue = user && !profile;
    
    if (hasAuthIssue) {
      return (
        <div className="fixed top-16 left-0 right-0 z-40 p-4">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Debug Info</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-sm">
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
                <p><strong>Profile:</strong> {profile ? 'Found' : 'Missing'}</p>
                <p><strong>Issue:</strong> User exists but profile is missing</p>
                <p><strong>Action:</strong> Check console logs for profile creation errors</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return null;
};

export default ErrorLogger;
