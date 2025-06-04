
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import ProfileStatusBanner from '@/components/ProfileStatusBanner';

const AdminDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <ProfileStatusBanner />
      <div className="pt-16">
        <AdminDashboard />
      </div>
    </>
  );
};

export default AdminDashboardPage;
