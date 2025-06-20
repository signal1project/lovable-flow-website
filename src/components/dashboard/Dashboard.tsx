import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <EmailVerificationBanner />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {profile?.full_name}
            </h1>
            <p className="text-gray-600 capitalize">
              {profile?.role} Dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {profile?.full_name}</p>
                  <p><strong>Role:</strong> {profile?.role}</p>
                  <p><strong>Country:</strong> {profile?.country}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile?.role === 'broker' && (
                    <>
                      <Button className="w-full" variant="outline">
                        Upload Client Files
                      </Button>
                      <Button className="w-full" variant="outline">
                        Find Lenders
                      </Button>
                    </>
                  )}
                  {profile?.role === 'lender' && (
                    <>
                      <Button className="w-full" variant="outline">
                        Update Guidelines
                      </Button>
                      <Button className="w-full" variant="outline">
                        View Applications
                      </Button>
                    </>
                  )}
                  {profile?.role === 'admin' && (
                    <>
                      <Button className="w-full" variant="outline">
                        Manage Users
                      </Button>
                      <Button className="w-full" variant="outline">
                        View System Stats
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
