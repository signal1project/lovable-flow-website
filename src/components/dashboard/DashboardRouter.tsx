
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const DashboardRouter = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  console.log('DashboardRouter - user:', user, 'profile:', profile, 'loading:', loading);

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
  const roleRoutes = {
    admin: '/dashboard/admin',
    lender: '/dashboard/lender',
    broker: '/dashboard/broker'
  };

  const targetRoute = roleRoutes[profile.role as keyof typeof roleRoutes];
  
  if (targetRoute) {
    console.log(`Redirecting to ${targetRoute} for role: ${profile.role}`);
    return <Navigate to={targetRoute} replace />;
  }

  // Fallback if role is not recognized
  console.log('Role not recognized, redirecting to onboarding');
  toast({
    title: "Profile Incomplete",
    description: "Please complete your profile setup",
  });
  return <Navigate to="/onboarding" replace />;
};

export default DashboardRouter;
