import React, { useState } from 'react';
import { useHR } from '../../context/HRContext';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  const { departments, employees, leaveRequests } = useHR();
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  // Weekly attendance data
  const weeklyAttendance = [
    { day: 'Mon', present: 9, remote: 3, away: 1, rate: '92%' },
    { day: 'Tue', present: 10, remote: 2, away: 0, rate: '100%' },
    { day: 'Wed', present: 9, remote: 4, away: 1, rate: '92%' },
    { day: 'Thu', present: 8, remote: 3, away: 2, rate: '85%' },
    { day: 'Fri', present: 9, remote: 5, away: 1, rate: '90%' },
  ];

  // Department counts
  const deptStats = departments.map((dept) => {
    const count = employees.filter((e) => e.departmentId === dept.id).length;
    return {
      name: dept.name,
      code: dept.code,
      count,
      budget: dept.budget,
      color: dept.color,
    };
  });

  const maxDeptCount = Math.max(...deptStats.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Attendance Weekly Trends (2 Cols) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Weekly Attendance Velocity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Physical office vs remote split over the current cycle</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 shrink-0" />
              <span>Office</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 shrink-0" />
              <span>Remote</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 shrink-0" />
              <span>Leave / Away</span>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-100">
            {weeklyAttendance.map((item, idx) => {
              const maxScale = 12; // total staff reference
              const officeHeight = (item.present / maxScale) * 100;
              const remoteHeight = (item.remote / maxScale) * 100;
              const isHovered = activeDayIndex === idx;

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center group cursor-pointer relative"
                  onMouseEnter={() => setActiveDayIndex(idx)}
                  onMouseLeave={() => setActiveDayIndex(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap font-mono">
                      {item.day}: {item.present} Office · {item.remote} Remote ({item.rate})
                    </div>
                  )}

                  {/* Bars */}
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-44">
                    <div
                      className="w-1/2 bg-indigo-600 rounded-t-sm transition-all duration-300 group-hover:bg-indigo-700"
                      style={{ height: `${officeHeight}%` }}
                    />
                    <div
                      className="w-1/2 bg-sky-400 rounded-t-sm transition-all duration-300 group-hover:bg-sky-500"
                      style={{ height: `${remoteHeight}%` }}
                    />
                  </div>

                  <span className="text-xs font-medium text-slate-600 mt-2 block">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
          <span>Target minimum attendance rate: 85%</span>
          <span className="font-mono tabular-nums text-emerald-700 font-medium">Weekly Average: 91.8%</span>
        </div>
      </div>

      {/* Department Headcount Breakdown (1 Col) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Department Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Staff distribution across core divisions</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5 mt-2">
            {deptStats.map((dept) => {
              const percentage = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate">{dept.name}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {dept.count} {dept.count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 15)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Active divisions: {departments.length}</span>
          <span className="font-mono tabular-nums text-slate-700 font-medium">
            Total Staff: {employees.length}
          </span>
        </div>
      </div>
    </div>
  );
};
