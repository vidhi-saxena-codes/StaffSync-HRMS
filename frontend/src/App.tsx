/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { ToastContainer } from './components/common/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout: React.FC = () => {
  const { currentUser } = useHR();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // If no active user session, render the Login Page
  if (!currentUser) {
    return <LoginPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Toast feedback alerts */}
      <ToastContainer />

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Primary Workspace Viewport (offset by 256px on md+ screens) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'employees' && <EmployeesPage />}
          {activeTab === 'departments' && <DepartmentsPage />}
          {activeTab === 'attendance' && <AttendancePage />}
          {activeTab === 'leave' && <LeavePage />}
          {activeTab === 'payroll' && <PayrollPage />}
          {activeTab === 'settings' && <ProfileSettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HRProvider>
      <MainLayout />
    </HRProvider>
  );
}
