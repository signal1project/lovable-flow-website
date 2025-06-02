
import BrokerDashboard from '@/components/dashboard/BrokerDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const BrokerDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="pt-16">
        <BrokerDashboard />
      </div>
    </>
  );
};

export default BrokerDashboardPage;
