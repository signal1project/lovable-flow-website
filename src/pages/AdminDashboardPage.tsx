
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import Navigation from '@/components/Navigation';

const AdminDashboardPage = () => {
  return (
    <>
      <Navigation />
      <div className="pt-16">
        <AdminDashboard />
      </div>
    </>
  );
};

export default AdminDashboardPage;
