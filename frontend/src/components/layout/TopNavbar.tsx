import React, { useState } from 'react';
import {
  Menu,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Search,
  Download,
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { NavTab } from './Sidebar';

interface TopNavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  setMobileOpen: (open: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  setMobileOpen,
}) => {
  const {
    currentUser,
    isCheckedIn,
    isCheckedOut,
    checkIn,
    checkOut,
    todayAttendance,
    activities,
    resetToDemoData,
    isDbConnected,
  } = useHR();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Executive Overview',
    employees: 'Employee Directory',
    departments: 'Department Governance',
    attendance: 'Time & Attendance Log',
    leave: 'Leave & Absence Management',
    payroll: 'Payroll & Compensation',
    settings: 'Organization Settings',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left Zone: Mobile toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg md:hidden hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 font-medium hidden sm:inline">StaffSync</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="font-semibold text-slate-900 truncate">
            {tabTitles[activeTab]}
          </h1>
        </nav>
      </div>

      {/* Right Zone: Interactive Check-in widget + Reset Data + Notification + Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Real-time Clock In / Clock Out Quick Action */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono text-slate-600 tabular-nums">
            {todayAttendance?.checkInTime
              ? `Clocked ${todayAttendance.checkInTime.slice(0, 5)}`
              : 'Not Clocked In'}
          </span>
          {!isCheckedIn ? (
            <button
              onClick={() => checkIn('Office')}
              className="ml-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
            >
              Clock In
            </button>
          ) : !isCheckedOut ? (
            <button
              onClick={() => checkOut()}
              className="ml-1 px-2.5 py-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors"
            >
              Clock Out
            </button>
          ) : (
            <span className="ml-1 text-[11px] font-medium text-emerald-700">Completed</span>
          )}
        </div>

        {/* Database Status Indicator */}
        <div
          title={isDbConnected ? 'MongoDB connected and active' : 'Connected to full-stack API server'}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
        >
          <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-indigo-500'}`} />
          <span className="text-[11px] font-medium text-slate-700">
            {isDbConnected ? 'MongoDB Connected' : 'API Active'}
          </span>
        </div>

        {/* Download Project ZIP */}
        <a
          href="/staffsync-hrms.zip"
          download="staffsync-hrms.zip"
          title="Download complete StaffSync project ZIP package"
          className="px-2.5 py-1.5 text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Download ZIP</span>
        </a>

        {/* Demo Data Reset */}
        <button
          onClick={resetToDemoData}
          title="Reset dataset to initial pristine corporate state"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden md:flex items-center gap-1.5 text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset Data</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            aria-label="View recent alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    System Activity Log
                  </h4>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    {activities.length} events
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                      <div className="flex items-center justify-between text-slate-800 font-medium mb-1">
                        <span>{act.title}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{act.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs">
                {currentUser?.name.slice(0, 2).toUpperCase() || 'SS'}
              </div>
            )}
            <div className="hidden lg:block text-left text-xs">
              <span className="font-semibold text-slate-900 block leading-tight">
                {currentUser?.name || 'Administrator'}
              </span>
              <span className="text-slate-500 text-[11px]">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 text-xs text-slate-700">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{currentUser?.name}</p>
                  <p className="text-slate-500 truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                >
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('employees');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                >
                  <span>Team Directory</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
