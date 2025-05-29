
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const DashboardRouter = () => {
  const { user, profile, loading } = useAuth();

  console.log('DashboardRouter - user:', user, 'profile:', profile, 'loading:', loading);

  if (loading) {
    console.log('Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    console.log('No profile, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to role-specific dashboard
  if (profile.role === 'admin') {
    console.log('Redirecting to admin dashboard');
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (profile.role === 'lender') {
    console.log('Redirecting to lender dashboard');
    return <Navigate to="/dashboard/lender" replace />;
  }

  if (profile.role === 'broker') {
    console.log('Redirecting to broker dashboard');
    return <Navigate to="/dashboard/broker" replace />;
  }

  // Fallback if role is not recognized
  console.log('Role not recognized, redirecting to onboarding');
  return <Navigate to="/onboarding" replace />;
};

export default DashboardRouter;
