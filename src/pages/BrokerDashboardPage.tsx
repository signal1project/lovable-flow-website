
import BrokerDashboard from '@/components/dashboard/BrokerDashboard';
import Navigation from '@/components/Navigation';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import ProfileStatusBanner from '@/components/ProfileStatusBanner';

const BrokerDashboardPage = () => {
  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <ProfileStatusBanner />
      <div className="pt-16">
        <BrokerDashboard />
      </div>
    </>
  );
};

export default BrokerDashboardPage;
