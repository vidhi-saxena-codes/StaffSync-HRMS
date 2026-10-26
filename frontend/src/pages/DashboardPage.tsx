import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { StatCards } from '../components/dashboard/StatCards';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { NavTab } from '../components/layout/Sidebar';
import { Plus, Calendar, Clock, DollarSign, Users, Sparkles } from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface DashboardPageProps {
  setActiveTab: (tab: NavTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { currentUser, isCheckedIn, isCheckedOut, checkIn, checkOut, todayAttendance, addEmployee, departments, applyLeave } = useHR();

  // Quick modals on Dashboard
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  // Quick Employee State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeptId, setNewDeptId] = useState(departments[0]?.id || '');
  const [newRole, setNewRole] = useState('Full Stack Developer');
  const [newSalary, setNewSalary] = useState(125000);

  // Quick Leave State
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-26');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-27');

  const handleQuickAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) return;

    const dept = departments.find((d) => d.id === newDeptId) || departments[0];
    addEmployee({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: '+1 (555) 019-8800',
      avatar: '',
      departmentId: dept.id,
      departmentName: dept.name,
      jobTitle: newRole.trim(),
      role: 'Employee',
      employmentType: 'Full-Time',
      status: 'Active',
      salary: Number(newSalary),
      location: 'San Francisco, CA',
      joinDate: new Date().toISOString().split('T')[0],
    });

    setIsAddEmployeeOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
  };

  const handleQuickApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const s = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);
    const days = Math.max(1, Math.round((end.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    applyLeave({
      employeeId: currentUser?.id || 'emp-101',
      employeeName: currentUser?.name || 'Sarah Jenkins',
      employeeCode: 'STF-0101',
      avatar: currentUser?.avatar || '',
      departmentName: currentUser?.department || 'People Operations',
      leaveType: 'Annual',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: days,
      reason: leaveReason.trim(),
    });

    setIsApplyLeaveOpen(false);
    setLeaveReason('');
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Primary Executive Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back, {currentUser?.name || 'Administrator'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
              {currentUser?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time workplace overview for October 19, 2026 · All systems nominal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsApplyLeaveOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Apply Leave</span>
          </button>

          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatCards />

      {/* Interactive Charts */}
      <DashboardCharts />

      {/* Recent Activity & Celebration Milestones */}
      <RecentActivity
        setActiveTab={setActiveTab}
        onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
        onOpenApplyLeave={() => setIsApplyLeaveOpen(true)}
      />

      {/* Quick Add Employee Modal */}
      <Modal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        title="Quick Onboard Employee"
        description="Rapid employee profile creation with default benefits assignment."
        maxWidth="md"
      >
        <form onSubmit={handleQuickAddEmployee} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                placeholder="e.g. Jordan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                placeholder="e.g. Reed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              placeholder="jordan.reed@staffsync.corp"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
              <select
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary ($ USD)</label>
            <input
              type="number"
              value={newSalary}
              onChange={(e) => setNewSalary(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddEmployeeOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Add Staff
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Apply Leave Modal */}
      <Modal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        title="Quick Apply for Time Off"
        maxWidth="md"
      >
        <form onSubmit={handleQuickApplyLeave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveStartDate}
                onChange={(e) => setLeaveStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={leaveEndDate}
                onChange={(e) => setLeaveEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Reason for Absence *</label>
            <textarea
              rows={3}
              required
              placeholder="State reason and handover..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyLeaveOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
