
import LenderDashboard from '@/components/dashboard/LenderDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import ProfileStatusBanner from '@/components/ProfileStatusBanner';

const LenderDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <ProfileStatusBanner />
      <div className="pt-16">
        <LenderDashboard />
      </div>
    </>
  );
};

export default LenderDashboardPage;
