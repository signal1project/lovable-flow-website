
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const DashboardRouter = () => {
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
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to role-specific dashboard
  if (profile.role === 'lender') {
    return <Navigate to="/dashboard/lender" replace />;
  }

  if (profile.role === 'broker') {
    return <Navigate to="/dashboard/broker" replace />;
  }

  // Fallback if role is not recognized
  return <Navigate to="/onboarding" replace />;
};

export default DashboardRouter;
