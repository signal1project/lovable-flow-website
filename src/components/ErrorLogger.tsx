
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorLogger = () => {
  const { user, profile, loading, refreshProfile } = useAuth();

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
            <AlertTitle>Profile Loading Issue</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2 text-sm">
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
                <p><strong>Profile:</strong> {profile ? 'Found' : 'Missing'}</p>
                <p><strong>Issue:</strong> User exists but profile is missing or failed to load</p>
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={refreshProfile}
                    className="mr-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Profile Load
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
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
