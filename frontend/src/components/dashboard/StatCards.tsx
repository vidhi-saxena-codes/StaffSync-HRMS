import React from 'react';
import {
  Users,
  UserCheck,
  CalendarClock,
  DollarSign,
  TrendingUp,
  Building,
  Briefcase
} from 'lucide-react';
import { useHR } from '../../context/HRContext';

export const StatCards: React.FC = () => {
  const { employees, attendanceRecords, leaveRequests, payrollRecords, departments } = useHR();

  // Headcount
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === 'Active').length;
  
  // Attendance today
  const todayStr = '2026-10-19';
  const todayRecords = attendanceRecords.filter((a) => a.date === todayStr);
  const presentCount = todayRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  // On leave today
  const onLeaveCount = employees.filter((e) => e.status === 'On Leave').length;
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending').length;

  // Monthly Payroll total
  const monthlyPayrollTotal = payrollRecords.reduce((acc, p) => acc + p.netPay, 0);

  // Total Open Roles across departments
  const totalOpenPositions = departments.reduce((acc, d) => acc + d.openPositions, 0);

  const stats = [
    {
      title: 'Total Workforce',
      value: totalEmployees.toString(),
      subtext: `${activeCount} active · ${totalEmployees - activeCount} away`,
      trend: '+2 this month',
      icon: Users,
      trendUp: true,
    },
    {
      title: 'Present Today',
      value: `${attendanceRate}%`,
      subtext: `${presentCount} of ${totalEmployees} clocked in`,
      trend: '+4% vs last week',
      icon: UserCheck,
      trendUp: true,
    },
    {
      title: 'On Leave',
      value: onLeaveCount.toString(),
      subtext: `${pendingLeaves} requests pending review`,
      trend: 'Normal capacity',
      icon: CalendarClock,
      trendUp: false,
    },
    {
      title: 'Monthly Net Payroll',
      value: `$${(monthlyPayrollTotal / 1000).toFixed(1)}k`,
      subtext: `${payrollRecords.length} staff processed`,
      trend: 'Oct 2026 cycle',
      icon: DollarSign,
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Icon className="w-4 h-4 text-slate-700" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">{stat.subtext}</span>
                <span className="text-slate-600 font-mono text-[11px] tabular-nums">
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
