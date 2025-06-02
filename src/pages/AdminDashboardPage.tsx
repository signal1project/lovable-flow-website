
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const AdminDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="pt-16">
        <AdminDashboard />
      </div>
    </>
  );
};

export default AdminDashboardPage;
