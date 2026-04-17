'use client';

import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../../components/DashboardLayout';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p>Welcome, Admin! You have full access to manage users, vendors, drivers, and reports.</p>
            {/* Add admin-specific widgets/cards */}
          </div>
        );
      case 'vendor':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Vendor Dashboard</h2>
            <p>Welcome, Vendor! Manage your drivers and drug testing operations.</p>
            {/* Add vendor-specific widgets */}
          </div>
        );
      case 'driver':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Driver Dashboard</h2>
            <p>Welcome, Driver! View your drug test results and schedule.</p>
            {/* Add driver-specific widgets */}
          </div>
        );
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}