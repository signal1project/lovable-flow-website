
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LenderProfileCompletion from '@/components/onboarding/LenderProfileCompletion';
import BrokerProfileCompletion from '@/components/onboarding/BrokerProfileCompletion';

const ProfileCompletion = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'lender') {
    return <LenderProfileCompletion />;
  }

  if (profile.role === 'broker') {
    return <BrokerProfileCompletion />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default ProfileCompletion;
