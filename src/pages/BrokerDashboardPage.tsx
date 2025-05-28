
import BrokerDashboard from '@/components/dashboard/BrokerDashboard';
import Navigation from '@/components/Navigation';

const BrokerDashboardPage = () => {
  return (
    <>
      <Navigation />
      <div className="pt-16">
        <BrokerDashboard />
      </div>
    </>
  );
};

export default BrokerDashboardPage;
