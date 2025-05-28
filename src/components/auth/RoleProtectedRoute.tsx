
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'lender' | 'broker';
}

const RoleProtectedRoute = ({ children, allowedRole }: RoleProtectedRouteProps) => {
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

  // If user is accessing wrong dashboard, redirect to correct one
  if (profile.role !== allowedRole) {
    const correctDashboard = profile.role === 'lender' ? '/dashboard/lender' : '/dashboard/broker';
    return <Navigate to={correctDashboard} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
