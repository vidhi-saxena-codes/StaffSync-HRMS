import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Receipt,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase
} from 'lucide-react';
import { useHR } from '../../context/HRContext';

export type NavTab =
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentUser, setCurrentUser, employees, leaveRequests, switchUserRole } = useHR();

  const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'Pending').length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users, badge: employees.length },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Tracking', icon: CalendarDays, badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined },
    { id: 'payroll', label: 'Payroll', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-500/20">
              S
            </div>
            <div>
              <span className="text-base font-semibold text-white tracking-tight">StaffSync</span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">ENTERPRISE HRMS</span>
            </div>
          </div>
        </div>

        {/* Workspace Role Switcher Banner */}
        <div className="px-4 py-3 mx-3 my-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Role</span>
            <span className="text-xs font-medium text-indigo-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {currentUser?.role || 'Guest'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-lg">
            <button
              onClick={() => switchUserRole('Admin')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                currentUser?.role === 'Admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Admin role"
            >
              Admin
            </button>
            <button
              onClick={() => switchUserRole('Manager')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                currentUser?.role === 'Manager'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Manager role"
            >
              Mgr
            </button>
            <button
              onClick={() => switchUserRole('Employee')}
              className={`py-1 text-[11px] font-medium rounded transition-colors ${
                currentUser?.role === 'Employee'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Employee role"
            >
              Staff
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono tabular-nums ${
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs shrink-0">
                  {currentUser?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2) || 'SS'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Staff User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.jobTitle || 'Team Member'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
