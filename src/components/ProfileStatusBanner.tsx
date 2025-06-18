import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useNavigate } from 'react-router-dom';

interface ProfileStatusBannerProps {
  className?: string;
}

const ProfileStatusBanner = ({ className = 'mb-6' }: ProfileStatusBannerProps) => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { isComplete, loading: completionLoading } = useProfileCompletion();
  const navigate = useNavigate();

  // Don't show banner if still loading or user not authenticated
  if (authLoading || completionLoading || !user) {
    return null;
  }

  // Show banner if profile is missing
  if (!profile) {
    return (
      <Alert variant="destructive" className={className}>
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
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Profile Setup Required</AlertTitle>
        <AlertDescription>
          Please complete your profile information to access all features.
        </AlertDescription>
      </Alert>
    );
  }

  // Show banner for incomplete role-specific profile
  if (!isComplete && (profile.role === 'lender' || profile.role === 'broker')) {
    return (
      <Alert className={`bg-orange-50 border-orange-200 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Complete Your Profile</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span className="text-orange-700">
            Complete your {profile.role} profile to unlock all features and get the most out of the platform.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile-completion')}
            className="ml-4 bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
          >
            Complete Profile
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default ProfileStatusBanner;
