
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Access Denied",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
    } else if (!loading && user && !profile) {
      console.log('User exists but no profile found, redirecting to onboarding');
      toast({
        title: "Profile Setup Required",
        description: "Please complete your profile setup",
      });
    } else if (!loading && user && profile && requiredRole && profile.role !== requiredRole) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
    }
  }, [loading, user, profile, requiredRole, toast]);

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

  if (requiredRole && profile.role !== requiredRole) {
    // Redirect to correct dashboard based on actual role
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

export default ProtectedRoute;
