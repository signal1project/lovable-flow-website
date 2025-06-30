import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LenderOnboarding from './LenderOnboarding';
import BrokerOnboarding from './BrokerOnboarding';

const OnboardingRouter = () => {
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
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (profile.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (profile.role === 'lender') {
    return <LenderOnboarding />;
  }

  if (profile.role === 'broker') {
    return <BrokerOnboarding />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default OnboardingRouter;
