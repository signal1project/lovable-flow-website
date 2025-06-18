
import LenderDashboard from '@/components/dashboard/LenderDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const LenderDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="pt-16">
        <LenderDashboard />
      </div>
    </>
  );
};

export default LenderDashboardPage;
