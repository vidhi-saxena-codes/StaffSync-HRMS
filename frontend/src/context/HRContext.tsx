import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  ActivityItem,
  UserSession,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_ACTIVITIES,
} from '../data/mockData';
import { api, setAuthToken } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface HRContextType {
  currentUser: UserSession | null;
  setCurrentUser: (user: UserSession | null) => void;
  switchUserRole: (role: 'Admin' | 'Manager' | 'Employee') => Promise<void>;
  
  // Database status
  isDbConnected: boolean;
  refreshData: () => Promise<void>;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'employeeCode'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  
  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord | undefined;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkIn: (location?: 'Office' | 'Remote' | 'Hybrid', notes?: string) => void;
  checkOut: () => void;
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  
  // Leave
  leaveRequests: LeaveRequest[];
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  reviewLeave: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void;
  
  // Payroll
  payrollRecords: PayrollRecord[];
  processAllPayroll: () => void;
  updatePayrollStatus: (id: string, status: 'Paid' | 'Processing' | 'Pending') => void;
  
  // Activities
  activities: ActivityItem[];
  
  // Toast notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Utilities
  resetToDemoData: () => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'staffsync_hrms_';

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}employees`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}departments`);
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}leaves`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payroll`);
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Sync state to LocalStorage as instant cache
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}employees`, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}departments`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}attendance`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}leaves`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}payroll`, JSON.stringify(payrollRecords));
  }, [payrollRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  // Toast Helpers
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all collections from MongoDB Backend
  const refreshData = useCallback(async () => {
    try {
      const health = await api.health();
      setIsDbConnected(health.database.includes('MongoDB (Connected)'));

      const [empsRes, deptsRes, attRes, leavesRes, payrollRes, actRes] =
        await Promise.allSettled([
          api.employees.getAll(),
          api.departments.getAll(),
          api.attendance.getAll(),
          api.leaves.getAll(),
          api.payroll.getAll(),
          api.activities.getAll(),
        ]);

      if (empsRes.status === 'fulfilled' && Array.isArray(empsRes.value) && empsRes.value.length > 0) {
        setEmployees(empsRes.value);
      }
      if (deptsRes.status === 'fulfilled' && Array.isArray(deptsRes.value) && deptsRes.value.length > 0) {
        setDepartments(deptsRes.value);
      }
      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value) && attRes.value.length > 0) {
        setAttendanceRecords(attRes.value);
      }
      if (leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value) && leavesRes.value.length > 0) {
        setLeaveRequests(leavesRes.value);
      }
      if (payrollRes.status === 'fulfilled' && Array.isArray(payrollRes.value) && payrollRes.value.length > 0) {
        setPayrollRecords(payrollRes.value);
      }
      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value) && actRes.value.length > 0) {
        setActivities(actRes.value);
      }
    } catch (err: any) {
      console.warn('[StaffSync] Initial data fetch warning:', err.message);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Activity logger
  const logActivity = (
    title: string,
    description: string,
    category: ActivityItem['category']
  ) => {
    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      title,
      description,
      timestamp: 'Just now',
      category,
      actorName: currentUser ? currentUser.name : 'System',
      actorAvatar: currentUser?.avatar,
    };
    setActivities((prev) => [newItem, ...prev.slice(0, 19)]);

    // Persist activity to backend
    api.activities.create({
      title,
      description,
      category,
      actorName: currentUser ? currentUser.name : 'System',
      actorAvatar: currentUser?.avatar,
    }).catch((err) => console.warn('Activity logging API warning:', err.message));
  };

  // Switch User Role
  const switchUserRole = async (role: 'Admin' | 'Manager' | 'Employee') => {
    try {
      const res = await api.auth.login({ role });
      if (res.user) {
        setCurrentUser(res.user);
        setAuthToken(res.token);
        addToast(`Switched persona to ${role} (${res.user.name})`, 'info');
        return;
      }
    } catch {
      // Local fallback
      if (role === 'Admin') {
        const admin = {
          id: 'usr-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@staffsync.corp',
          role: 'Admin' as const,
          jobTitle: 'VP of People & Culture',
          avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
          department: 'People Operations',
        };
        setCurrentUser(admin);
        addToast('Switched persona to HR Admin (Sarah Jenkins)', 'info');
      } else if (role === 'Manager') {
        const mgr = {
          id: 'usr-2',
          name: 'David Chen',
          email: 'david.chen@staffsync.corp',
          role: 'Manager' as const,
          jobTitle: 'Principal Staff Engineer',
          avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg',
          department: 'Engineering',
        };
        setCurrentUser(mgr);
        addToast('Switched persona to Engineering Manager (David Chen)', 'info');
      } else {
        const emp = {
          id: 'usr-3',
          name: 'Maya Lin',
          email: 'maya.lin@staffsync.corp',
          role: 'Employee' as const,
          jobTitle: 'Lead Product Designer',
          avatar: '',
          department: 'Product & Design',
        };
        setCurrentUser(emp);
        addToast('Switched persona to Employee (Maya Lin)', 'info');
      }
    }
  };

  // Today's attendance calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(
    (a) =>
      a.date === todayStr &&
      (a.employeeName === currentUser?.name || a.employeeId === currentUser?.id)
  );
  const isCheckedIn = Boolean(todayAttendance && todayAttendance.checkInTime);
  const isCheckedOut = Boolean(todayAttendance && todayAttendance.checkOutTime);

  const checkIn = (location: 'Office' | 'Remote' | 'Hybrid' = 'Office', notes?: string) => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    // Optimistic update
    if (todayAttendance) {
      const updated = attendanceRecords.map((rec) => {
        if (rec.id === todayAttendance.id) {
          return {
            ...rec,
            checkInTime: timeStr,
            status: 'Present' as const,
            workLocation: location,
            notes: notes || rec.notes,
          };
        }
        return rec;
      });
      setAttendanceRecords(updated);
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        employeeCode: 'STF-0101',
        avatar: currentUser.avatar,
        departmentName: currentUser.department,
        date: todayStr,
        checkInTime: timeStr,
        status: 'Present',
        workLocation: location,
        totalHours: 0,
        notes: notes || 'Clocked in via dashboard',
      };
      setAttendanceRecords([newRec, ...attendanceRecords]);
    }

    logActivity(
      'Attendance Check-In',
      `${currentUser.name} checked in from ${location} at ${timeStr}.`,
      'attendance'
    );
    addToast(`Successfully checked in at ${timeStr} (${location})`, 'success');

    // Persist to MongoDB
    api.attendance
      .checkIn({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        departmentName: currentUser.department,
        avatar: currentUser.avatar,
        location,
        notes,
      })
      .then((saved) => {
        if (saved) {
          setAttendanceRecords((prev) =>
            prev.map((r) => (r.date === todayStr && r.employeeId === currentUser.id ? saved : r))
          );
        }
      })
      .catch((err) => {
        console.error('Check-in persistence failed:', err);
      });
  };

  const checkOut = () => {
    if (!currentUser || !todayAttendance) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    let hours = 8.0;
    if (todayAttendance.checkInTime) {
      const [inH, inM] = todayAttendance.checkInTime.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      const diffMinutes = Math.max(30, outH * 60 + outM - (inH * 60 + inM));
      hours = Math.round((diffMinutes / 60) * 10) / 10;
    }

    // Optimistic update
    const updated = attendanceRecords.map((rec) => {
      if (rec.id === todayAttendance.id) {
        return {
          ...rec,
          checkOutTime: timeStr,
          totalHours: hours,
        };
      }
      return rec;
    });
    setAttendanceRecords(updated);

    logActivity(
      'Attendance Check-Out',
      `${currentUser.name} checked out at ${timeStr}. Total: ${hours}h.`,
      'attendance'
    );
    addToast(`Checked out successfully at ${timeStr}. Logged ${hours} hours.`, 'success');

    // Persist to MongoDB
    api.attendance
      .checkOut({ employeeId: currentUser.id })
      .then((saved) => {
        if (saved && saved.checkOutTime) {
          setAttendanceRecords((prev) =>
            prev.map((r) => (r.id === todayAttendance.id ? saved : r))
          );
        }
      })
      .catch((err) => {
        console.error('Check-out persistence failed:', err);
      });
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    );
    addToast('Attendance record updated', 'success');

    // Persist to MongoDB
    api.attendance.update(id, updates).catch((err) => {
      console.error('Attendance update failed:', err);
    });
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const tempId = `att-${Date.now()}`;
    const newRec: AttendanceRecord = {
      ...record,
      id: tempId,
    };
    setAttendanceRecords((prev) => [newRec, ...prev]);
    addToast('New attendance record added', 'success');

    // Persist to MongoDB
    api.attendance
      .create(record)
      .then((saved) => {
        if (saved) {
          setAttendanceRecords((prev) =>
            prev.map((r) => (r.id === tempId ? saved : r))
          );
        }
      })
      .catch((err) => {
        console.error('Attendance creation failed:', err);
      });
  };

  // Employee CRUD
  const addEmployee = (empData: Omit<Employee, 'id' | 'employeeCode'>) => {
    const nextCodeNum = 100 + employees.length + 1;
    const employeeCode = `STF-0${nextCodeNum}`;
    const tempId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...empData,
      id: tempId,
      employeeCode,
    };

    setEmployees((prev) => [newEmp, ...prev]);

    // Add default payroll draft locally
    const base = Math.round(newEmp.salary / 12);
    const tax = Math.round(base * 0.24);
    const health = 450;
    const pension = Math.round(base * 0.05);
    const newPayroll: PayrollRecord = {
      id: `pr-${Date.now()}`,
      employeeId: newEmp.id,
      employeeName: `${newEmp.firstName} ${newEmp.lastName}`,
      employeeCode: newEmp.employeeCode,
      departmentName: newEmp.departmentName,
      jobTitle: newEmp.jobTitle,
      avatar: newEmp.avatar,
      payPeriod: 'October 2026',
      baseSalary: base,
      allowances: 600,
      bonuses: 0,
      taxDeduction: tax,
      healthInsurance: health,
      pension401k: pension,
      netPay: base + 600 - (tax + health + pension),
      status: 'Processing',
      paymentMethod: 'Direct Deposit',
    };
    setPayrollRecords((prev) => [newPayroll, ...prev]);

    logActivity(
      'Employee Added',
      `Onboarded ${newEmp.firstName} ${newEmp.lastName} (${newEmp.jobTitle}).`,
      'employee'
    );
    addToast(`Employee ${newEmp.firstName} ${newEmp.lastName} added successfully!`, 'success');

    // Persist to MongoDB
    api.employees
      .create(empData)
      .then((saved) => {
        if (saved) {
          setEmployees((prev) =>
            prev.map((e) => (e.id === tempId ? saved : e))
          );
        }
      })
      .catch((err) => {
        console.error('Employee creation failed:', err);
        addToast(`Failed to save employee to database: ${err.message}`, 'error');
      });

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );

    if (updates.firstName || updates.lastName || updates.departmentName) {
      setPayrollRecords((prev) =>
        prev.map((pr) => {
          if (pr.employeeId === id) {
            const currentEmp = employees.find((e) => e.id === id);
            const fn = updates.firstName ?? currentEmp?.firstName ?? '';
            const ln = updates.lastName ?? currentEmp?.lastName ?? '';
            return {
              ...pr,
              employeeName: `${fn} ${ln}`.trim(),
              departmentName: updates.departmentName ?? pr.departmentName,
              jobTitle: updates.jobTitle ?? pr.jobTitle,
            };
          }
          return pr;
        })
      );
    }

    logActivity('Employee Updated', `Updated records for employee ID ${id}.`, 'employee');
    addToast('Employee details saved', 'success');

    // Persist to MongoDB
    api.employees.update(id, updates).catch((err) => {
      console.error('Employee update failed:', err);
      addToast(`Failed to save employee changes: ${err.message}`, 'error');
    });
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    logActivity(
      'Employee Removed',
      `Offboarded ${target ? `${target.firstName} ${target.lastName}` : id}.`,
      'employee'
    );
    addToast('Employee removed from system', 'info');

    // Persist to MongoDB
    api.employees.delete(id).catch((err) => {
      console.error('Employee deletion failed:', err);
      addToast(`Failed to delete employee from database: ${err.message}`, 'error');
    });
  };

  // Department CRUD
  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const tempId = `dept-${Date.now()}`;
    const newDept: Department = {
      ...deptData,
      id: tempId,
    };
    setDepartments((prev) => [...prev, newDept]);
    logActivity('Department Created', `Added ${newDept.name} (${newDept.code}) department.`, 'system');
    addToast(`Department ${newDept.name} created`, 'success');

    // Persist to MongoDB
    api.departments
      .create(deptData)
      .then((saved) => {
        if (saved) {
          setDepartments((prev) =>
            prev.map((d) => (d.id === tempId ? saved : d))
          );
        }
      })
      .catch((err) => {
        console.error('Department creation failed:', err);
        addToast(`Failed to save department: ${err.message}`, 'error');
      });

    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === id ? { ...dept, ...updates } : dept))
    );
    addToast('Department updated', 'success');

    // Persist to MongoDB
    api.departments.update(id, updates).catch((err) => {
      console.error('Department update failed:', err);
    });
  };

  const deleteDepartment = (id: string) => {
    const target = departments.find((d) => d.id === id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    addToast(`Department ${target?.name || ''} deleted`, 'info');

    // Persist to MongoDB
    api.departments.delete(id).catch((err) => {
      console.error('Department deletion failed:', err);
    });
  };

  // Leave operations
  const applyLeave = (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const tempId = `lev-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: tempId,
      status: 'Pending',
      appliedDate: today,
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
    logActivity(
      'Leave Request Submitted',
      `${newLeave.employeeName} requested ${newLeave.daysCount} day(s) of ${newLeave.leaveType} leave.`,
      'leave'
    );
    addToast('Leave request submitted for review', 'success');

    // Persist to MongoDB
    api.leaves
      .create(leaveData)
      .then((saved) => {
        if (saved) {
          setLeaveRequests((prev) =>
            prev.map((l) => (l.id === tempId ? saved : l))
          );
        }
      })
      .catch((err) => {
        console.error('Leave application failed:', err);
        addToast(`Failed to submit leave request: ${err.message}`, 'error');
      });
  };

  const reviewLeave = (id: string, status: 'Approved' | 'Rejected', reason?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updates = {
      status,
      rejectionReason: reason,
      reviewedBy: currentUser?.name || 'Administrator',
      reviewedDate: today,
    };

    setLeaveRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    const target = leaveRequests.find((l) => l.id === id);
    logActivity(
      `Leave Request ${status}`,
      `${currentUser?.name} marked ${target?.employeeName}'s leave as ${status}.`,
      'leave'
    );
    addToast(`Leave request ${status.toLowerCase()} successfully`, status === 'Approved' ? 'success' : 'info');

    // Persist to MongoDB
    api.leaves.update(id, updates).catch((err) => {
      console.error('Leave review update failed:', err);
    });
  };

  // Payroll operations
  const processAllPayroll = () => {
    const today = new Date().toISOString().split('T')[0];
    setPayrollRecords((prev) =>
      prev.map((p) => ({
        ...p,
        status: 'Paid',
        paymentDate: today,
      }))
    );
    const totalAmount = payrollRecords.reduce((sum, p) => sum + p.netPay, 0);
    logActivity(
      'Payroll Processed',
      `Disbursed payroll to ${payrollRecords.length} employees ($${totalAmount.toLocaleString()} net).`,
      'payroll'
    );
    addToast(`Successfully disbursed $${totalAmount.toLocaleString()} to ${payrollRecords.length} accounts!`, 'success');

    // Persist to MongoDB
    api.payroll.disburseAll().catch((err) => {
      console.error('Payroll disbursement failed:', err);
    });
  };

  const updatePayrollStatus = (id: string, status: 'Paid' | 'Processing' | 'Pending') => {
    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<PayrollRecord> = {
      status,
      paymentDate: status === 'Paid' ? today : undefined,
    };

    setPayrollRecords((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast(`Payroll status changed to ${status}`, 'success');

    // Persist to MongoDB
    api.payroll.update(id, updates).catch((err) => {
      console.error('Payroll status update failed:', err);
    });
  };

  // Reset database to initial demo dataset
  const resetToDemoData = async () => {
    try {
      await api.resetData();
      await refreshData();
      addToast('Restored workspace and MongoDB database to pristine demo dataset', 'info');
    } catch (err: any) {
      console.warn('Backend reset failed, resetting local store:', err.message);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}employees`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}departments`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}attendance`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}leaves`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}payroll`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}activities`);

      setCurrentUser(INITIAL_USER);
      setEmployees(INITIAL_EMPLOYEES);
      setDepartments(INITIAL_DEPARTMENTS);
      setAttendanceRecords(INITIAL_ATTENDANCE);
      setLeaveRequests(INITIAL_LEAVE_REQUESTS);
      setPayrollRecords(INITIAL_PAYROLL);
      setActivities(INITIAL_ACTIVITIES);
      addToast('Restored local demo dataset', 'info');
    }
  };

  return (
    <HRContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserRole,
        isDbConnected,
        refreshData,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        attendanceRecords,
        todayAttendance,
        isCheckedIn,
        isCheckedOut,
        checkIn,
        checkOut,
        updateAttendanceRecord,
        addAttendanceRecord,
        leaveRequests,
        applyLeave,
        reviewLeave,
        payrollRecords,
        processAllPayroll,
        updatePayrollStatus,
        activities,
        toasts,
        addToast,
        removeToast,
        resetToDemoData,
      }}
    >
      {children}
    </HRContext.Provider>
  );
};

export const useHR = () => {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
};
