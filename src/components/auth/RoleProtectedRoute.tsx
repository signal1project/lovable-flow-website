import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'lender' | 'broker' | 'admin';
}

const RoleProtectedRoute = ({ children, allowedRole }: RoleProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
    } else if (!loading && user && profile && profile.role !== allowedRole) {
      toast({
        title: "Access Denied",
        description: `This page is only accessible to ${allowedRole}s`,
        variant: "destructive",
      });
    }
  }, [loading, user, profile, allowedRole, toast]);

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

  if (profile && profile.role !== allowedRole) {
    const redirectMap = {
      lender: '/dashboard/lender',
      broker: '/dashboard/broker',
      admin: '/dashboard/admin'
    };
    const correctDashboard = redirectMap[profile.role as keyof typeof redirectMap] || '/dashboard';
    return <Navigate to={correctDashboard} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
