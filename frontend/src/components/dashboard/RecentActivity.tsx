import React from 'react';
import { useHR } from '../../context/HRContext';
import {
  UserPlus,
  CalendarCheck,
  Clock,
  DollarSign,
  Cake,
  Award,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface RecentActivityProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAddEmployee: () => void;
  onOpenApplyLeave: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  setActiveTab,
  onOpenAddEmployee,
  onOpenApplyLeave,
}) => {
  const { activities, employees } = useHR();

  // Upcoming celebration highlights
  const upcomingEvents = [
    { name: 'David Chen', type: 'Work Anniversary', detail: '6th Year Anniversary', date: 'Oct 24', avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg' },
    { name: 'Elena Rostova', type: 'Birthday', detail: 'Birthday celebration', date: 'Oct 28', avatar: '/src/assets/images/avatar_employee_elena_1792426921576.jpg' },
    { name: 'Sarah Jenkins', type: 'Quarterly Review', detail: 'Executive All-Hands', date: 'Nov 02', avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'employee':
        return <UserPlus className="w-3.5 h-3.5 text-indigo-600" />;
      case 'leave':
        return <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'attendance':
        return <Clock className="w-3.5 h-3.5 text-emerald-600" />;
      case 'payroll':
        return <DollarSign className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Feed (2 Cols) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent HR Operations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Audit log of system actions and employee updates</p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 5).map((act) => (
            <div key={act.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getCategoryIcon(act.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{act.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{act.description}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
                  <span>Logged by:</span>
                  <span className="font-medium text-slate-600">{act.actorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions & Celebrations (1 Col) */}
      <div className="space-y-6">
        {/* Quick Operations panel */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenAddEmployee}
              className="p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors group"
            >
              <UserPlus className="w-4 h-4 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-900 block">Add Staff</span>
              <span className="text-[11px] text-slate-500 block">Create profile</span>
            </button>

            <button
              onClick={onOpenApplyLeave}
              className="p-3 text-left border border-slate-200 rounded-lg hover:border-amber-400 hover:bg-amber-50/40 transition-colors group"
            >
              <CalendarCheck className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-900 block">Request Leave</span>
              <span className="text-[11px] text-slate-500 block">Submit ticket</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="p-3 text-left border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors group"
            >
              <Clock className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-900 block">Attendance Log</span>
              <span className="text-[11px] text-slate-500 block">Daily roster</span>
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/40 transition-colors group"
            >
              <DollarSign className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-slate-900 block">Run Payroll</span>
              <span className="text-[11px] text-slate-500 block">Disburse cycle</span>
            </button>
          </div>
        </div>

        {/* Celebrations & Milestones */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming Milestones</h3>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {evt.avatar ? (
                  <img
                    src={evt.avatar}
                    alt={evt.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-xs text-slate-700 shrink-0">
                    {evt.name.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{evt.name}</p>
                  <p className="text-[11px] text-slate-500">{evt.detail}</p>
                </div>
                <span className="text-xs font-mono text-indigo-600 font-medium shrink-0">
                  {evt.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
