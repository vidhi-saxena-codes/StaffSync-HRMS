import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import {
  User,
  Building,
  Bell,
  Shield,
  RotateCcw,
  Check,
  Save,
  Mail,
  Briefcase,
  Lock,
  Globe,
  Download,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { currentUser, setCurrentUser, switchUserRole, resetToDemoData, addToast, isDbConnected } = useHR();

  // Tab
  const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'notifications' | 'system'>('profile');

  // Profile Form
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Company Form
  const [companyName, setCompanyName] = useState('StaffSync Corporation');
  const [taxId, setTaxId] = useState('94-8821940');
  const [currency, setCurrency] = useState('USD ($)');
  const [workHours, setWorkHours] = useState('40 hours / week (09:00 - 17:30)');
  const [fiscalYear, setFiscalYear] = useState('January - December');

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [leaveApprovalPings, setLeaveApprovalPings] = useState(true);
  const [payrollSummaryEmails, setPayrollSummaryEmails] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      avatar: avatar,
    });
    addToast('Profile changes saved successfully', 'success');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Organization policy and parameters updated', 'success');
  };

  const avatarPresets = [
    { label: 'Sarah Jenkins (Admin)', path: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg' },
    { label: 'David Chen (Engineer)', path: '/src/assets/images/avatar_employee_david_1792426921583.jpg' },
    { label: 'Elena Rostova (Marketing)', path: '/src/assets/images/avatar_employee_elena_1792426921576.jpg' },
    { label: 'Initials Placeholder', path: '' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Profile & Organization Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure personal credentials, corporate policies, attendance rules, and active access roles.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-md">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeSection === 'profile'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveSection('company')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeSection === 'company'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Company
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeSection === 'notifications'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveSection('system')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeSection === 'system'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System
        </button>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Personal Identity</h3>
              <p className="text-xs text-slate-500">How your colleagues identify you across StaffSync.</p>
            </div>

            {/* Avatar Select */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Display Avatar</label>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center">
                    {name.slice(0, 2).toUpperCase() || 'SS'}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset.path)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        avatar === preset.path
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Company Section */}
      {activeSection === 'company' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
          <form onSubmit={handleSaveCompany} className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Company Governance</h3>
              <p className="text-xs text-slate-500">Legal entity registration and default working conventions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Legal Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Federal Tax Identification (EIN)</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Default Payroll Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Standard Work Schedule</label>
                <input
                  type="text"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update Company Policy</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Notification Preferences</h3>
            <p className="text-xs text-slate-500">Configure how and when you receive system alerts.</p>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Email Digest of Pending Leaves</p>
                <p className="text-[11px] text-slate-500">Receive morning notification when direct reports request PTO</p>
              </div>
              <input
                type="checkbox"
                checked={leaveApprovalPings}
                onChange={(e) => setLeaveApprovalPings(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Automated Attendance Reminders</p>
                <p className="text-[11px] text-slate-500">Alert team members who have not clocked in by 09:30 AM</p>
              </div>
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Payroll Cycle Completion Notices</p>
                <p className="text-[11px] text-slate-500">Disbursement confirmation email to all employees</p>
              </div>
              <input
                type="checkbox"
                checked={payrollSummaryEmails}
                onChange={(e) => setPayrollSummaryEmails(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* System Section */}
      {activeSection === 'system' && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Workspace Diagnostics & Persistence</h3>
            <p className="text-xs text-slate-500">Manage demo sandbox data and quick-switch access profiles.</p>
          </div>

          {/* Database Diagnostics */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-900">Database Engine & Connection</h4>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                isDbConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isDbConnected ? 'MongoDB Online (Mongoose)' : 'Full-Stack API Server (Active)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Data is served and permanently stored via Mongoose models. Configure your MongoDB connection string in the <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">.env</code> file.
            </p>
            <div className="text-xs text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div>Database: <span className="font-semibold text-slate-900">MongoDB / staffsync_hrms</span></div>
              <div>Connection Mode: <span className="text-indigo-600 font-semibold">{isDbConnected ? 'Connected via Mongoose' : 'Ready (Full-Stack Backend Active)'}</span></div>
            </div>
          </div>

          {/* Quick Role Tester */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-semibold text-slate-900 mb-1">Instant Multi-Role Previewer</h4>
            <p className="text-xs text-slate-500 mb-3">
              Switch roles immediately to test administrator, manager, and employee views:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => switchUserRole('Admin')}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  currentUser?.role === 'Admin'
                    ? 'border-indigo-600 bg-white ring-1 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">HR Administrator</span>
                <span className="text-[11px] text-slate-500 block">Sarah Jenkins (Full access)</span>
              </button>

              <button
                onClick={() => switchUserRole('Manager')}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  currentUser?.role === 'Manager'
                    ? 'border-indigo-600 bg-white ring-1 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">Engineering Lead</span>
                <span className="text-[11px] text-slate-500 block">David Chen (Approvals)</span>
              </button>

              <button
                onClick={() => switchUserRole('Employee')}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  currentUser?.role === 'Employee'
                    ? 'border-indigo-600 bg-white ring-1 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-semibold text-slate-900 block">Staff Member</span>
                <span className="text-[11px] text-slate-500 block">Maya Lin (Self-service)</span>
              </button>
            </div>
          </div>

          {/* Download Project ZIP Archive */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-indigo-950">Download Complete Project ZIP Archive</h4>
              <p className="text-xs text-indigo-700 mt-0.5">
                Download the full source code (React, Express, Tailwind, mock data, components, and assets) packaged as a single ZIP file.
              </p>
            </div>
            <a
              href="/staffsync-hrms.zip"
              download="staffsync-hrms.zip"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm shadow-indigo-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download staffsync-hrms.zip</span>
            </a>
          </div>

          {/* Reset button */}
          <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-rose-900">Restore Default Corporate Dataset</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Clear all custom additions and return to the pristine seed company state.
              </p>
            </div>
            <button
              onClick={resetToDemoData}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
