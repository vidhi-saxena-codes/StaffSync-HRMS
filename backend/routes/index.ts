import { Request, Response, Application } from 'express';
import { DepartmentModel } from '../models/Department';
import { EmployeeModel } from '../models/Employee';
import { AttendanceModel } from '../models/Attendance';
import { LeaveModel } from '../models/Leave';
import { PayrollModel } from '../models/Payroll';
import { ActivityModel } from '../models/Activity';
import { UserModel } from '../models/User';
import { isDbConnected, getDbInfo } from '../db';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../authHelper';
import { seedDatabase } from '../seed';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_ACTIVITIES,
  INITIAL_USER,
} from '../data/mockData';
import fs from 'fs';
import path from 'path';

// Local memory fallback store in case MongoDB local instance is offline
let memoryStore = {
  departments: [...INITIAL_DEPARTMENTS],
  employees: [...INITIAL_EMPLOYEES],
  attendance: [...INITIAL_ATTENDANCE],
  leaves: [...INITIAL_LEAVE_REQUESTS],
  payroll: [...INITIAL_PAYROLL],
  activities: [...INITIAL_ACTIVITIES],
  users: [
    {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@staffsync.corp',
      role: 'Admin' as const,
      jobTitle: 'VP of People & Culture',
      avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
      department: 'People Operations',
    },
    {
      id: 'usr-2',
      name: 'David Chen',
      email: 'david.chen@staffsync.corp',
      role: 'Manager' as const,
      jobTitle: 'Principal Staff Engineer',
      avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg',
      department: 'Engineering',
    },
    {
      id: 'usr-3',
      name: 'Maya Lin',
      email: 'maya.lin@staffsync.corp',
      role: 'Employee' as const,
      jobTitle: 'Lead Product Designer',
      avatar: '',
      department: 'Product & Design',
    },
  ],
};

export function setupApiRoutes(app: Application) {
  // -------------------------------------------------------------
  // System Health & Database Diagnostics
  // -------------------------------------------------------------
  app.get('/api/health', async (_req: Request, res: Response) => {
    const dbInfo = getDbInfo();
    let stats = {
      employees: 0,
      departments: 0,
      attendance: 0,
      leaves: 0,
      payroll: 0,
    };

    if (dbInfo.connected) {
      stats.employees = await EmployeeModel.countDocuments();
      stats.departments = await DepartmentModel.countDocuments();
      stats.attendance = await AttendanceModel.countDocuments();
      stats.leaves = await LeaveModel.countDocuments();
      stats.payroll = await PayrollModel.countDocuments();
    } else {
      stats.employees = memoryStore.employees.length;
      stats.departments = memoryStore.departments.length;
      stats.attendance = memoryStore.attendance.length;
      stats.leaves = memoryStore.leaves.length;
      stats.payroll = memoryStore.payroll.length;
    }

    res.json({
      status: 'online',
      service: 'StaffSync HRMS Enterprise API',
      database: dbInfo.connected ? 'MongoDB (Connected)' : 'Fallback Memory Mode (MongoDB Offline)',
      dbInfo,
      recordCounts: stats,
      timestamp: new Date().toISOString(),
    });
  });

  // -------------------------------------------------------------
  // Authentication Routes
  // -------------------------------------------------------------
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      if (!email && !role) {
        return res.status(400).json({ error: 'Email or role is required for authentication' });
      }

      let user: any = null;

      if (isDbConnected()) {
        if (email) {
          user = await UserModel.findOne({ email: email.toLowerCase().trim() });
          // If password was provided and user has password, check it
          if (user && password && user.password && !verifyPassword(password, user.password)) {
            // Check fallback for easy demo login
            if (password !== 'password123' && password !== 'admin' && password !== 'demo') {
              return res.status(401).json({ error: 'Invalid password' });
            }
          }
        } else if (role) {
          user = await UserModel.findOne({ role });
        }
      }

      // Fallback check
      if (!user) {
        if (email) {
          user = memoryStore.users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase().trim()
          );
        } else if (role) {
          user = memoryStore.users.find((u) => u.role === role);
        }
      }

      // If user still not found, create a sensible session object
      if (!user) {
        const generatedUser = {
          id: `usr-${Date.now()}`,
          name: email ? email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Corporate User',
          email: email || 'user@staffsync.corp',
          role: role || 'Admin',
          jobTitle: 'HR Operations Lead',
          avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
          department: 'People Operations',
        };

        if (isDbConnected()) {
          try {
            user = await UserModel.create({
              ...generatedUser,
              password: hashPassword(password || 'password123'),
            });
          } catch {
            user = generatedUser;
          }
        } else {
          memoryStore.users.push(generatedUser as any);
          user = generatedUser;
        }
      }

      const userSession = {
        id: user.id || user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        jobTitle: user.jobTitle,
        avatar: user.avatar,
        department: user.department,
      };

      const token = generateToken(userSession);

      // Log activity
      await logSystemActivity(
        'User Sign In',
        `${userSession.name} logged into StaffSync HRMS as ${userSession.role}.`,
        'system',
        userSession.name,
        userSession.avatar
      );

      res.json({
        success: true,
        user: userSession,
        token,
      });
    } catch (error: any) {
      console.error('[API Auth] Login error:', error);
      res.status(500).json({ error: error.message || 'Authentication error' });
    }
  });

  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ user: INITIAL_USER });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.json({ user: INITIAL_USER });
      }

      res.json({ user: decoded });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Employee Management Routes
  // -------------------------------------------------------------
  app.get('/api/employees', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const employees = await EmployeeModel.find().sort({ createdAt: -1 });
        return res.json(employees);
      }
      res.json(memoryStore.employees);
    } catch (error: any) {
      console.error('[API Employees] Fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const emp = await EmployeeModel.findOne({ id });
        if (!emp) return res.status(404).json({ error: 'Employee not found' });
        return res.json(emp);
      }
      const emp = memoryStore.employees.find((e) => e.id === id);
      if (!emp) return res.status(404).json({ error: 'Employee not found' });
      res.json(emp);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/employees', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const count = isDbConnected()
        ? await EmployeeModel.countDocuments()
        : memoryStore.employees.length;

      const employeeCode = body.employeeCode || `STF-0${100 + count + 1}`;
      const id = body.id || `emp-${Date.now()}`;

      const newEmpData = {
        ...body,
        id,
        employeeCode,
      };

      let createdEmp: any;

      if (isDbConnected()) {
        createdEmp = await EmployeeModel.create(newEmpData);

        // Auto-create initial payroll draft in MongoDB
        const base = Math.round((newEmpData.salary || 100000) / 12);
        const tax = Math.round(base * 0.24);
        const health = 450;
        const pension = Math.round(base * 0.05);

        await PayrollModel.create({
          id: `pr-${Date.now()}`,
          employeeId: newEmpData.id,
          employeeName: `${newEmpData.firstName} ${newEmpData.lastName}`,
          employeeCode: newEmpData.employeeCode,
          departmentName: newEmpData.departmentName,
          jobTitle: newEmpData.jobTitle,
          avatar: newEmpData.avatar || '',
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
        });
      } else {
        memoryStore.employees.unshift(newEmpData);
        createdEmp = newEmpData;
      }

      await logSystemActivity(
        'Employee Added',
        `Onboarded ${newEmpData.firstName} ${newEmpData.lastName} (${newEmpData.jobTitle}).`,
        'employee'
      );

      res.status(201).json(createdEmp);
    } catch (error: any) {
      console.error('[API Employees] Create error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isDbConnected()) {
        const updated = await EmployeeModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Employee not found' });

        // Sync name or department changes to Payroll
        if (updates.firstName || updates.lastName || updates.departmentName || updates.jobTitle) {
          const syncUpdates: Record<string, any> = {};
          if (updates.firstName || updates.lastName) {
            syncUpdates.employeeName = `${updated.firstName} ${updated.lastName}`.trim();
          }
          if (updates.departmentName) syncUpdates.departmentName = updates.departmentName;
          if (updates.jobTitle) syncUpdates.jobTitle = updates.jobTitle;

          await PayrollModel.updateMany({ employeeId: id }, { $set: syncUpdates });
        }

        return res.json(updated);
      }

      // Memory fallback
      memoryStore.employees = memoryStore.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates } : emp
      );

      res.json({ success: true, id });
    } catch (error: any) {
      console.error('[API Employees] Update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        const emp = await EmployeeModel.findOneAndDelete({ id });
        if (!emp) return res.status(404).json({ error: 'Employee not found' });

        await logSystemActivity(
          'Employee Removed',
          `Offboarded employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode}).`,
          'employee'
        );

        return res.json({ success: true, message: `Employee ${id} deleted` });
      }

      memoryStore.employees = memoryStore.employees.filter((e) => e.id !== id);
      res.json({ success: true, message: `Employee ${id} deleted` });
    } catch (error: any) {
      console.error('[API Employees] Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Department Management Routes
  // -------------------------------------------------------------
  app.get('/api/departments', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const departments = await DepartmentModel.find().sort({ name: 1 });
        return res.json(departments);
      }
      res.json(memoryStore.departments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const dept = await DepartmentModel.findOne({ id });
        if (!dept) return res.status(404).json({ error: 'Department not found' });
        return res.json(dept);
      }
      const dept = memoryStore.departments.find((d) => d.id === id);
      if (!dept) return res.status(404).json({ error: 'Department not found' });
      res.json(dept);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/departments', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const id = body.id || `dept-${Date.now()}`;
      const newDeptData = { ...body, id };

      let dept: any;
      if (isDbConnected()) {
        dept = await DepartmentModel.create(newDeptData);
      } else {
        memoryStore.departments.push(newDeptData);
        dept = newDeptData;
      }

      await logSystemActivity(
        'Department Created',
        `Created ${newDeptData.name} (${newDeptData.code}) department.`,
        'system'
      );

      res.status(201).json(dept);
    } catch (error: any) {
      console.error('[API Departments] Create error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isDbConnected()) {
        const updated = await DepartmentModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Department not found' });
        return res.json(updated);
      }

      memoryStore.departments = memoryStore.departments.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      );
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/departments/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isDbConnected()) {
        const dept = await DepartmentModel.findOneAndDelete({ id });
        if (!dept) return res.status(404).json({ error: 'Department not found' });
        return res.json({ success: true, message: `Department ${id} deleted` });
      }

      memoryStore.departments = memoryStore.departments.filter((d) => d.id !== id);
      res.json({ success: true, message: `Department ${id} deleted` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Attendance Management Routes
  // -------------------------------------------------------------
  app.get('/api/attendance', async (req: Request, res: Response) => {
    try {
      const { date, employeeId } = req.query;
      const filter: Record<string, any> = {};
      if (date) filter.date = date;
      if (employeeId) filter.employeeId = employeeId;

      if (isDbConnected()) {
        const records = await AttendanceModel.find(filter).sort({ date: -1, checkInTime: -1 });
        return res.json(records);
      }

      let filtered = [...memoryStore.attendance];
      if (date) filtered = filtered.filter((a) => a.date === date);
      if (employeeId) filtered = filtered.filter((a) => a.employeeId === employeeId);
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/attendance', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const id = body.id || `att-${Date.now()}`;
      const newRecord = { ...body, id };

      if (isDbConnected()) {
        const created = await AttendanceModel.create(newRecord);
        return res.status(201).json(created);
      }

      memoryStore.attendance.unshift(newRecord);
      res.status(201).json(newRecord);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/attendance/check-in', async (req: Request, res: Response) => {
    try {
      const { employeeId, employeeName, departmentName, avatar, location, notes } = req.body;
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      if (isDbConnected()) {
        let existing = await AttendanceModel.findOne({
          employeeId,
          date: todayStr,
        });

        if (existing) {
          existing.checkInTime = timeStr;
          existing.workLocation = location || 'Office';
          existing.status = 'Present';
          if (notes) existing.notes = notes;
          await existing.save();
          return res.json(existing);
        }

        const created = await AttendanceModel.create({
          id: `att-${Date.now()}`,
          employeeId,
          employeeName: employeeName || 'Employee',
          employeeCode: 'STF-0101',
          avatar: avatar || '',
          departmentName: departmentName || 'Operations',
          date: todayStr,
          checkInTime: timeStr,
          status: 'Present',
          workLocation: location || 'Office',
          totalHours: 0,
          notes: notes || 'Clocked in via dashboard',
        });

        await logSystemActivity(
          'Attendance Check-In',
          `${employeeName || 'Employee'} checked in from ${location || 'Office'} at ${timeStr}.`,
          'attendance'
        );

        return res.status(201).json(created);
      }

      // Memory fallback
      const newRec = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: employeeName || 'Employee',
        employeeCode: 'STF-0101',
        avatar: avatar || '',
        departmentName: departmentName || 'Operations',
        date: todayStr,
        checkInTime: timeStr,
        status: 'Present' as const,
        workLocation: location || 'Office',
        totalHours: 0,
        notes: notes || 'Clocked in via dashboard',
      };
      memoryStore.attendance.unshift(newRec);
      res.status(201).json(newRec);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/attendance/check-out', async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.body;
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      if (isDbConnected()) {
        const record = await AttendanceModel.findOne({ employeeId, date: todayStr });
        if (!record) {
          return res.status(404).json({ error: 'No active check-in found for today.' });
        }

        let hours = 8.0;
        if (record.checkInTime) {
          const [inH, inM] = record.checkInTime.split(':').map(Number);
          const [outH, outM] = timeStr.split(':').map(Number);
          const diffMinutes = Math.max(30, outH * 60 + outM - (inH * 60 + inM));
          hours = Math.round((diffMinutes / 60) * 10) / 10;
        }

        record.checkOutTime = timeStr;
        record.totalHours = hours;
        await record.save();

        await logSystemActivity(
          'Attendance Check-Out',
          `${record.employeeName} checked out at ${timeStr}. Total hours: ${hours}h.`,
          'attendance'
        );

        return res.json(record);
      }

      // Memory fallback
      const found = memoryStore.attendance.find(
        (a) => a.employeeId === employeeId && a.date === todayStr
      );
      if (found) {
        found.checkOutTime = timeStr;
        found.totalHours = 8.0;
      }
      res.json(found || { success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/attendance/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isDbConnected()) {
        const updated = await AttendanceModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Attendance record not found' });
        return res.json(updated);
      }

      memoryStore.attendance = memoryStore.attendance.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      );
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Leave Management Routes
  // -------------------------------------------------------------
  app.get('/api/leaves', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const leaves = await LeaveModel.find().sort({ createdAt: -1 });
        return res.json(leaves);
      }
      res.json(memoryStore.leaves);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/leaves', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const id = body.id || `lev-${Date.now()}`;
      const newLeaveData = {
        ...body,
        id,
        status: body.status || 'Pending',
        appliedDate: body.appliedDate || new Date().toISOString().split('T')[0],
      };

      let created: any;
      if (isDbConnected()) {
        created = await LeaveModel.create(newLeaveData);
      } else {
        memoryStore.leaves.unshift(newLeaveData);
        created = newLeaveData;
      }

      await logSystemActivity(
        'Leave Request Submitted',
        `${newLeaveData.employeeName} requested ${newLeaveData.daysCount} day(s) of ${newLeaveData.leaveType} leave.`,
        'leave'
      );

      res.status(201).json(created);
    } catch (error: any) {
      console.error('[API Leaves] Create error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/leaves/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isDbConnected()) {
        const updated = await LeaveModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Leave request not found' });

        if (updates.status) {
          await logSystemActivity(
            `Leave Request ${updates.status}`,
            `${updates.reviewedBy || 'Manager'} marked ${updated.employeeName}'s leave as ${updates.status}.`,
            'leave'
          );
        }

        return res.json(updated);
      }

      memoryStore.leaves = memoryStore.leaves.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/leaves/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const deleted = await LeaveModel.findOneAndDelete({ id });
        if (!deleted) return res.status(404).json({ error: 'Leave request not found' });
        return res.json({ success: true, message: `Leave ${id} deleted` });
      }
      memoryStore.leaves = memoryStore.leaves.filter((l) => l.id !== id);
      res.json({ success: true, message: `Leave ${id} deleted` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Payroll Management Routes
  // -------------------------------------------------------------
  app.get('/api/payroll', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const payroll = await PayrollModel.find().sort({ createdAt: -1 });
        return res.json(payroll);
      }
      res.json(memoryStore.payroll);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payroll', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const id = body.id || `pr-${Date.now()}`;
      const newRecord = { ...body, id };

      if (isDbConnected()) {
        const created = await PayrollModel.create(newRecord);
        return res.status(201).json(created);
      }

      memoryStore.payroll.unshift(newRecord);
      res.status(201).json(newRecord);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/payroll/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (isDbConnected()) {
        const updated = await PayrollModel.findOneAndUpdate({ id }, { $set: updates }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Payroll record not found' });
        return res.json(updated);
      }

      memoryStore.payroll = memoryStore.payroll.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/payroll/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (isDbConnected()) {
        const deleted = await PayrollModel.findOneAndDelete({ id });
        if (!deleted) return res.status(404).json({ error: 'Payroll record not found' });
        return res.json({ success: true, message: `Payroll record ${id} deleted` });
      }
      memoryStore.payroll = memoryStore.payroll.filter((p) => p.id !== id);
      res.json({ success: true, message: `Payroll record ${id} deleted` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/payroll/disburse-all', async (_req: Request, res: Response) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      if (isDbConnected()) {
        await PayrollModel.updateMany({}, { $set: { status: 'Paid', paymentDate: todayStr } });
        const all = await PayrollModel.find();
        const totalAmount = all.reduce((sum, p) => sum + p.netPay, 0);

        await logSystemActivity(
          'Payroll Processed',
          `Disbursed payroll to ${all.length} employees ($${totalAmount.toLocaleString()} net).`,
          'payroll'
        );

        return res.json({ success: true, count: all.length, totalAmount });
      }

      memoryStore.payroll = memoryStore.payroll.map((p) => ({
        ...p,
        status: 'Paid' as const,
        paymentDate: todayStr,
      }));
      res.json({ success: true, count: memoryStore.payroll.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Activities Routes
  // -------------------------------------------------------------
  app.get('/api/activities', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        const activities = await ActivityModel.find().sort({ createdAt: -1 }).limit(25);
        return res.json(activities);
      }
      res.json(memoryStore.activities.slice(0, 25));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const activity = await logSystemActivity(
        body.title,
        body.description,
        body.category || 'system',
        body.actorName,
        body.actorAvatar
      );
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Summary Metrics / Dashboard Stats
  // -------------------------------------------------------------
  app.get('/api/stats', async (_req: Request, res: Response) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      if (isDbConnected()) {
        const [empCount, deptCount, attCount, payrollList] = await Promise.all([
          EmployeeModel.countDocuments({ status: 'Active' }),
          DepartmentModel.countDocuments(),
          AttendanceModel.countDocuments({ date: todayStr, status: 'Present' }),
          PayrollModel.find(),
        ]);

        const totalPayroll = payrollList.reduce((sum, p) => sum + p.netPay, 0);
        const attendanceRate = empCount > 0 ? `${Math.round((attCount / empCount) * 100)}%` : '92%';

        return res.json({
          totalEmployees: empCount,
          activeToday: attCount || Math.round(empCount * 0.9),
          departments: deptCount,
          attendanceRate,
          monthlyPayroll: `$${totalPayroll.toLocaleString()}`,
        });
      }

      // Memory fallback stats
      const totalPayroll = memoryStore.payroll.reduce((sum, p) => sum + p.netPay, 0);
      res.json({
        totalEmployees: memoryStore.employees.length,
        activeToday: Math.round(memoryStore.employees.length * 0.9),
        departments: memoryStore.departments.length,
        attendanceRate: '94%',
        monthlyPayroll: `$${totalPayroll.toLocaleString()}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------------------
  // Data Reset to Demo State
  // -------------------------------------------------------------
  app.post('/api/reset-data', async (_req: Request, res: Response) => {
    try {
      if (isDbConnected()) {
        await seedDatabase(true);
      } else {
        memoryStore = {
          departments: [...INITIAL_DEPARTMENTS],
          employees: [...INITIAL_EMPLOYEES],
          attendance: [...INITIAL_ATTENDANCE],
          leaves: [...INITIAL_LEAVE_REQUESTS],
          payroll: [...INITIAL_PAYROLL],
          activities: [...INITIAL_ACTIVITIES],
          users: [
            {
              id: 'usr-1',
              name: 'Sarah Jenkins',
              email: 'sarah.jenkins@staffsync.corp',
              role: 'Admin' as const,
              jobTitle: 'VP of People & Culture',
              avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
              department: 'People Operations',
            },
            {
              id: 'usr-2',
              name: 'David Chen',
              email: 'david.chen@staffsync.corp',
              role: 'Manager' as const,
              jobTitle: 'Principal Staff Engineer',
              avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg',
              department: 'Engineering',
            },
            {
              id: 'usr-3',
              name: 'Maya Lin',
              email: 'maya.lin@staffsync.corp',
              role: 'Employee' as const,
              jobTitle: 'Lead Product Designer',
              avatar: '',
              department: 'Product & Design',
            },
          ],
        };
      }

      await logSystemActivity(
        'Workspace Reset',
        'Database was restored to pristine demo dataset.',
        'system'
      );

      res.json({ success: true, message: 'Database reset to initial demo data' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

/**
 * Helper to log an activity into MongoDB or Memory Store
 */
async function logSystemActivity(
  title: string,
  description: string,
  category: 'employee' | 'leave' | 'attendance' | 'payroll' | 'system' = 'system',
  actorName: string = 'System',
  actorAvatar: string = ''
) {
  const item = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    title,
    description,
    timestamp: 'Just now',
    category,
    actorName,
    actorAvatar,
  };

  try {
    if (isDbConnected()) {
      return await ActivityModel.create(item);
    }
    memoryStore.activities.unshift(item as any);
    return item;
  } catch {
    memoryStore.activities.unshift(item as any);
    return item;
  }
}
