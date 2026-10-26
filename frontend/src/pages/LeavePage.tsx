import React, { useState } from 'react';
import { useHR } from '../context/HRContext';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  AlertCircle,
  UserCheck,
  FileText
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const LeavePage: React.FC = () => {
  const { leaveRequests, applyLeave, reviewLeave, currentUser, employees, addToast } = useHR();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    employeeId: currentUser ? currentUser.id : employees[0]?.id || '',
    leaveType: 'Annual' as LeaveType,
    startDate: '2026-10-26',
    endDate: '2026-10-28',
    reason: '',
  });

  // Calculate day count
  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff < 0) return 0;
    const days = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const handleOpenApply = () => {
    setFormData({
      employeeId: currentUser ? currentUser.id : employees[0]?.id || '',
      leaveType: 'Annual',
      startDate: '2026-10-26',
      endDate: '2026-10-28',
      reason: '',
    });
    setIsApplyModalOpen(true);
  };

  const handleSaveApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      addToast('Please provide a reason or handover note for the leave request.', 'error');
      return;
    }

    const emp = employees.find((e) => e.id === formData.employeeId) || {
      id: currentUser?.id || 'emp-101',
      firstName: currentUser?.name.split(' ')[0] || 'Staff',
      lastName: currentUser?.name.split(' ')[1] || 'Member',
      employeeCode: 'STF-0101',
      avatar: currentUser?.avatar || '',
      departmentName: currentUser?.department || 'People Operations',
    };

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      addToast('End date must be on or after start date.', 'error');
      return;
    }

    applyLeave({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      avatar: emp.avatar,
      departmentName: emp.departmentName,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysCount: days,
      reason: formData.reason.trim(),
    });

    setIsApplyModalOpen(false);
  };

  const handleApprove = (id: string) => {
    reviewLeave(id, 'Approved');
  };

  const handleRejectConfirm = () => {
    if (rejectingId) {
      reviewLeave(rejectingId, 'Rejected', rejectionReason.trim() || 'Schedule conflicts with critical sprint milestones.');
      setRejectingId(null);
      setRejectionReason('');
    }
  };

  // Leave balances summary
  const balances = [
    { title: 'Annual Paid Time Off', balance: '18 / 24 days', used: '6 days used', type: 'Annual' },
    { title: 'Medical / Sick Leave', balance: '10 / 12 days', used: '2 days used', type: 'Sick' },
    { title: 'Casual & Personal', balance: '3 / 5 days', used: '2 days used', type: 'Casual' },
    { title: 'Parental / Family Care', balance: '60 / 60 days', used: 'Full balance', type: 'Maternity/Paternity' },
  ];

  const pendingRequests = leaveRequests.filter((l) => l.status === 'Pending');
  const filteredHistory = leaveRequests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.leaveType === filterType;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Leave & Absence Tracking</h2>
          <p className="text-xs text-slate-500 mt-1">
            Submit time-off requests, monitor company leave allowances, and process team approvals.
          </p>
        </div>

        <button
          onClick={handleOpenApply}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Quotas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b, i) => (
          <div key={i} className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              {b.title}
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-2 tabular-nums">
              {b.balance}
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">{b.used}</div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Queue (Highlighted when items exist) */}
      {pendingRequests.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Action Required: Pending Approvals ({pendingRequests.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500">Managerial review required</span>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  {req.avatar ? (
                    <img
                      src={req.avatar}
                      alt={req.employeeName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-amber-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">
                      {req.employeeName.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{req.employeeName}</h4>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">({req.employeeCode})</span>
                      <span className="text-xs text-slate-600 font-medium">· {req.departmentName}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-700">
                      <span className="font-semibold text-indigo-700">{req.leaveType} Leave</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {req.startDate} to {req.endDate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-900">
                        {req.daysCount} {req.daysCount === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 italic bg-white/60 p-2 rounded-lg border border-amber-100/60">
                      "{req.reason}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setRejectingId(req.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Leave Records Log */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Comprehensive Leave Register</h3>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Request Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Leave Types</option>
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Maternity/Paternity">Parental</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3 font-mono">Date Range</th>
                <th className="px-4 py-3 font-mono text-center">Days</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Audit Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.employeeName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {item.employeeName.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{item.employeeName}</p>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">{item.employeeCode}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-800">{item.leaveType}</td>

                  <td className="px-4 py-3 font-mono text-slate-700 tabular-nums">
                    {item.startDate} → {item.endDate}
                  </td>

                  <td className="px-4 py-3 font-mono text-center tabular-nums font-semibold text-slate-900">
                    {item.daysCount}
                  </td>

                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={item.reason}>
                    {item.reason}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium ${
                        item.status === 'Approved'
                          ? 'text-emerald-700'
                          : item.status === 'Rejected'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {item.reviewedBy ? (
                      <span>
                        {item.reviewedBy} · <span className="font-mono tabular-nums">{item.reviewedDate}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Awaiting review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        description="Schedule paid absence, medical leave, or personal time off."
        maxWidth="md"
      >
        <form onSubmit={handleSaveApply} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Applying Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode} - {emp.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Leave Classification</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="Annual">Annual Leave (PTO)</option>
              <option value="Sick">Sick / Medical Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Maternity/Paternity">Parental Leave</option>
              <option value="Unpaid">Unpaid Sabbatical</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between text-slate-600">
            <span>Duration Requested:</span>
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              {calculateDays(formData.startDate, formData.endDate)} Day(s)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Reason / Handover Note *</label>
            <textarea
              rows={3}
              required
              placeholder="State reason for absence and note colleague handling urgent tasks..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Dialog Modal */}
      <Modal
        isOpen={Boolean(rejectingId)}
        onClose={() => setRejectingId(null)}
        title="Decline Leave Application"
        description="Provide a constructive reason for rejecting this leave request."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rejection Justification</label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Milestone delivery collision. Please consider alternative dates next week."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              onClick={() => setRejectingId(null)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
