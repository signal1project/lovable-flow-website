
import LenderDashboard from '@/components/dashboard/LenderDashboard';
import Navigation from '@/components/Navigation';

const LenderDashboardPage = () => {
  return (
    <>
      <Navigation />
      <div className="pt-16">
        <LenderDashboard />
      </div>
    </>
  );
};

export default LenderDashboardPage;
