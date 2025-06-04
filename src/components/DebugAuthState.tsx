
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DebugAuthState = () => {
  const { user, profile, loading } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto bg-black/90 text-white border-gray-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-green-400">🐛 Debug Auth State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <Badge variant={loading ? "destructive" : "default"} className="mb-1">
            Loading: {loading ? 'true' : 'false'}
          </Badge>
        </div>
        
        <div>
          <span className="text-blue-300">User:</span>
          {user ? (
            <div className="ml-2 space-y-1">
              <div>ID: {user.id}</div>
              <div>Email: {user.email}</div>
              <div>Verified: {user.email_confirmed_at ? '✅' : '❌'}</div>
            </div>
          ) : (
            <span className="text-red-300 ml-2">null</span>
          )}
        </div>

        <div>
          <span className="text-blue-300">Profile:</span>
          {profile ? (
            <div className="ml-2 space-y-1">
              <div>ID: {profile.id}</div>
              <div>Name: {profile.full_name}</div>
              <div>Role: {profile.role}</div>
              <div>Country: {profile.country}</div>
            </div>
          ) : (
            <span className="text-red-300 ml-2">null</span>
          )}
        </div>

        <div>
          <span className="text-blue-300">Current Route:</span>
          <div className="ml-2">{window.location.pathname}</div>
        </div>

        <div>
          <span className="text-blue-300">Expected Redirect:</span>
          <div className="ml-2">
            {profile?.role ? `/dashboard/${profile.role}` : 'Unknown'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugAuthState;
