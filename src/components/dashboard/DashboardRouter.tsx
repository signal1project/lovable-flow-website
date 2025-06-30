import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const DashboardRouter = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "destructive",
      });
    }
  }, [loading, user, toast]);

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
    // If loading is done, user exists, and profile is null, only redirect to onboarding for non-admins
    if (!loading && user && (!profile || profile?.role !== 'admin')) {
      return <Navigate to="/onboarding" replace />;
    }
    // Otherwise, wait for profile to load
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Redirect to role-specific dashboard
  const roleRoutes = {
    admin: '/dashboard/admin',
    lender: '/dashboard/lender',
    broker: '/dashboard/broker'
  };

  const targetRoute = roleRoutes[profile.role as keyof typeof roleRoutes];
  
  if (targetRoute) {
    return <Navigate to={targetRoute} replace />;
  }

  // Fallback if role is not recognized
  toast({
    title: "Profile Incomplete",
    description: "Please complete your profile setup",
  });
  return <Navigate to="/onboarding" replace />;
};

export default DashboardRouter;
