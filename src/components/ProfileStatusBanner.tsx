
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ProfileStatusBanner = () => {
  const { user, profile, loading, refreshProfile } = useAuth();

  // Don't show banner if still loading or user not authenticated
  if (loading || !user) {
    return null;
  }

  // Show banner if profile is missing
  if (!profile) {
    return (
      <Alert variant="destructive" className="mx-4 mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Profile Incomplete</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Your profile is missing or incomplete. This may prevent access to some features.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProfile}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Show banner for incomplete profile data
  if (!profile.full_name || !profile.role || !profile.country) {
    return (
      <Alert className="mx-4 mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Profile Setup Required</AlertTitle>
        <AlertDescription>
          Please complete your profile information to access all features.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default ProfileStatusBanner;
