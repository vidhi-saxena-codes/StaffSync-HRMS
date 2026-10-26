export type Role = 'Admin' | 'Manager' | 'Employee';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  role: Role;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinDate: string;
  salary: number; // Annual salary in USD
  location: string;
  managerName?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  headAvatar?: string;
  budget: number;
  openPositions: number;
  color: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half-Day' | 'Absent' | 'On Leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatar: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  totalHours?: number;
  status: AttendanceStatus;
  workLocation: 'Office' | 'Remote' | 'Hybrid';
  notes?: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatar: string;
  departmentName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  jobTitle: string;
  avatar: string;
  payPeriod: string; // e.g. "October 2026"
  baseSalary: number; // Monthly base
  allowances: number;
  bonuses: number;
  taxDeduction: number;
  healthInsurance: number;
  pension401k: number;
  netPay: number;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  paymentMethod: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'employee' | 'leave' | 'attendance' | 'payroll' | 'system';
  actorName: string;
  actorAvatar?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string;
  avatar: string;
  department: string;
}
