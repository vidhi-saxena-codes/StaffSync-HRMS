import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { AttendanceRecord, AttendanceStatus } from '../types';
import {
  Clock,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Filter,
  Plus,
  Edit2,
  FileSpreadsheet
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const AttendancePage: React.FC = () => {
  const {
    attendanceRecords,
    currentUser,
    isCheckedIn,
    isCheckedOut,
    todayAttendance,
    checkIn,
    checkOut,
    updateAttendanceRecord,
    addAttendanceRecord,
    employees,
    addToast,
  } = useHR();

  // Active live timer state
  const [currentTimer, setCurrentTimer] = useState<string>('00:00:00');
  const [workLocationChoice, setWorkLocationChoice] = useState<'Office' | 'Remote' | 'Hybrid'>('Office');
  const [dailyNotes, setDailyNotes] = useState('');

  // Table filters
  const todayIso = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(() => {
    // If records exist for today, default to today, otherwise fall back to 2026-10-19
    return '2026-10-19';
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Edit / Manual Modal
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: employees[0]?.id || '',
    date: todayIso,
    checkInTime: '09:00:00',
    checkOutTime: '17:30:00',
    totalHours: 8.5,
    status: 'Present' as AttendanceStatus,
    workLocation: 'Office' as 'Office' | 'Remote' | 'Hybrid',
    notes: 'Manual timesheet adjustment',
  });

  // Calculate live clock timer
  useEffect(() => {
    const updateTimer = () => {
      if (todayAttendance?.checkInTime && !todayAttendance.checkOutTime) {
        const [inH, inM, inS] = todayAttendance.checkInTime.split(':').map(Number);
        const now = new Date();
        const start = new Date();
        start.setHours(inH, inM, inS || 0);

        const diffMs = Math.max(0, now.getTime() - start.getTime());
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        const pad = (n: number) => n.toString().padStart(2, '0');
        setCurrentTimer(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      } else if (todayAttendance?.totalHours) {
        const h = Math.floor(todayAttendance.totalHours);
        const m = Math.round((todayAttendance.totalHours - h) * 60);
        setCurrentTimer(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
      } else {
        setCurrentTimer('00:00:00');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [todayAttendance]);

  // Attendance metrics for today
  const dayRecords = attendanceRecords.filter((r) => r.date === filterDate);
  const presentCount = dayRecords.filter((r) => r.status === 'Present').length;
  const lateCount = dayRecords.filter((r) => r.status === 'Late').length;
  const onLeaveCount = dayRecords.filter((r) => r.status === 'On Leave').length;
  const avgHours =
    dayRecords.length > 0
      ? (
          dayRecords.reduce((acc, r) => acc + (r.totalHours || 0), 0) /
          Math.max(dayRecords.filter((r) => (r.totalHours || 0) > 0).length, 1)
        ).toFixed(1)
      : '0.0';

  // Filtered rows
  const filteredRecords = dayRecords.filter((rec) => {
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || rec.workLocation === filterLocation;
    return matchesStatus && matchesLocation;
  });

  const handleClockInAction = () => {
    checkIn(workLocationChoice, dailyNotes);
    setDailyNotes('');
    setFilterDate(todayIso);
  };

  const handleClockOutAction = () => {
    checkOut();
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === manualForm.employeeId) || employees[0];
    addAttendanceRecord({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      avatar: emp.avatar,
      departmentName: emp.departmentName,
      date: manualForm.date,
      checkInTime: manualForm.checkInTime,
      checkOutTime: manualForm.checkOutTime,
      totalHours: Number(manualForm.totalHours),
      status: manualForm.status,
      workLocation: manualForm.workLocation,
      notes: manualForm.notes,
    });
    setIsManualModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateAttendanceRecord(editingRecord.id, {
      checkInTime: editingRecord.checkInTime,
      checkOutTime: editingRecord.checkOutTime,
      totalHours: Number(editingRecord.totalHours),
      status: editingRecord.status,
      workLocation: editingRecord.workLocation,
      notes: editingRecord.notes,
    });
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Check-in Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Time & Attendance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric & electronic timesheet logging, late detection, and shift tracking.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Interactive Punch Terminal Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* User Status & Timer */}
          <div className="md:col-span-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Personal Shift Tracker
            </span>
            <h3 className="text-lg font-bold mt-1 text-white flex items-center gap-2">
              {currentUser?.name}
              <span className="text-xs font-normal text-indigo-300 font-mono">
                ({currentUser?.role})
              </span>
            </h3>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold tracking-tight text-white tabular-nums">
                {currentTimer}
              </span>
              <span className="text-xs text-slate-400 font-mono">hrs:min:sec</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {isCheckedIn && !isCheckedOut
                ? `Clocked in at ${todayAttendance?.checkInTime} (${todayAttendance?.workLocation})`
                : isCheckedOut
                ? `Clocked out at ${todayAttendance?.checkOutTime} (Total ${todayAttendance?.totalHours} hrs)`
                : 'Ready for today’s shift registration'}
            </p>
          </div>

          {/* Controls: Location & Notes */}
          <div className="md:col-span-1 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Working From
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded-lg">
                {(['Office', 'Remote', 'Hybrid'] as const).map((loc) => (
                  <button
                    key={loc}
                    disabled={isCheckedIn && !isCheckedOut}
                    onClick={() => setWorkLocationChoice(loc)}
                    className={`py-1.5 text-xs font-medium rounded transition-colors ${
                      workLocationChoice === loc
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    } ${isCheckedIn && !isCheckedOut ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {!isCheckedIn && (
              <div>
                <input
                  type="text"
                  placeholder="Optional shift notes (e.g., Client meeting in town)"
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="md:col-span-1 flex flex-col gap-2.5 items-end justify-center">
            {!isCheckedIn ? (
              <button
                onClick={handleClockInAction}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Clock In Now</span>
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleClockOutAction}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shift completed for {filterDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block uppercase text-[10px] font-medium">Present Today</span>
          <span className="text-xl font-bold text-emerald-700 font-mono mt-1 block tabular-nums">
            {presentCount}
          </span>
          <span className="text-slate-400 text-[11px]">On-time attendance</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block uppercase text-[10px] font-medium">Late Check-ins</span>
          <span className="text-xl font-bold text-amber-600 font-mono mt-1 block tabular-nums">
            {lateCount}
          </span>
          <span className="text-slate-400 text-[11px]">Arrived after 09:15 AM</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block uppercase text-[10px] font-medium">Approved Leave</span>
          <span className="text-xl font-bold text-indigo-600 font-mono mt-1 block tabular-nums">
            {onLeaveCount}
          </span>
          <span className="text-slate-400 text-[11px]">Vacation / Medical</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-slate-500 block uppercase text-[10px] font-medium">Avg Working Hours</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block tabular-nums">
            {avgHours}h
          </span>
          <span className="text-slate-400 text-[11px]">Across active team</span>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date:</span>
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setFilterDate(todayIso)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                filterDate === todayIso
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilterDate('2026-10-19')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                filterDate === '2026-10-19'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Seed Data
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half-Day">Half-Day</option>
              <option value="On Leave">On Leave</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">All Locations</option>
              <option value="Office">Office</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 font-mono">Check-In</th>
                <th className="px-4 py-3 font-mono">Check-Out</th>
                <th className="px-4 py-3 font-mono text-right">Total Hours</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No attendance records for {filterDate}.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {rec.avatar ? (
                          <img
                            src={rec.avatar}
                            alt={rec.employeeName}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {rec.employeeName.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{rec.employeeName}</p>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">{rec.employeeCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">{rec.departmentName}</td>

                    <td className="px-4 py-3 font-mono tabular-nums text-slate-800">
                      {rec.checkInTime || '—'}
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums text-slate-800">
                      {rec.checkOutTime || (rec.checkInTime ? 'Active shift' : '—')}
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums text-right text-slate-900 font-medium">
                      {rec.totalHours ? `${rec.totalHours}h` : '0.0h'}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {rec.workLocation}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-medium ${
                          rec.status === 'Present'
                            ? 'text-emerald-700'
                            : rec.status === 'Late'
                            ? 'text-amber-700'
                            : rec.status === 'On Leave'
                            ? 'text-indigo-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingRecord(rec)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="Adjust Attendance"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Attendance Entry"
        description="Record timesheet entry on behalf of an employee."
        maxWidth="md"
      >
        <form onSubmit={handleSaveManual} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Employee</label>
            <select
              value={manualForm.employeeId}
              onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as AttendanceStatus })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half-Day">Half-Day</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Check In</label>
              <input
                type="time"
                step="1"
                value={manualForm.checkInTime}
                onChange={(e) => setManualForm({ ...manualForm, checkInTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Check Out</label>
              <input
                type="time"
                step="1"
                value={manualForm.checkOutTime}
                onChange={(e) => setManualForm({ ...manualForm, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Total Hours</label>
              <input
                type="number"
                step="0.1"
                value={manualForm.totalHours}
                onChange={(e) => setManualForm({ ...manualForm, totalHours: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Record Modal */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Adjust Attendance Timesheet"
        maxWidth="md"
      >
        {editingRecord && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-900">
                {editingRecord.employeeName} · {editingRecord.date}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Check In Time</label>
                <input
                  type="text"
                  value={editingRecord.checkInTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, checkInTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                  placeholder="08:45:00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Check Out Time</label>
                <input
                  type="text"
                  value={editingRecord.checkOutTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, checkOutTime: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                  placeholder="17:15:00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as AttendanceStatus })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingRecord.totalHours || 0}
                  onChange={(e) => setEditingRecord({ ...editingRecord, totalHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Update Hours
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
