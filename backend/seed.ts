import { DepartmentModel } from './models/Department';
import { EmployeeModel } from './models/Employee';
import { AttendanceModel } from './models/Attendance';
import { LeaveModel } from './models/Leave';
import { PayrollModel } from './models/Payroll';
import { ActivityModel } from './models/Activity';
import { UserModel } from './models/User';
import { hashPassword } from './authHelper';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_ACTIVITIES,
} from './data/mockData';

export async function seedDatabase(force: boolean = false) {
  try {
    const deptCount = await DepartmentModel.countDocuments();
    const empCount = await EmployeeModel.countDocuments();
    const userCount = await UserModel.countDocuments();

    if (force) {
      console.log('[StaffSync Seed] Force resetting database collections...');
      await Promise.all([
        DepartmentModel.deleteMany({}),
        EmployeeModel.deleteMany({}),
        AttendanceModel.deleteMany({}),
        LeaveModel.deleteMany({}),
        PayrollModel.deleteMany({}),
        ActivityModel.deleteMany({}),
        UserModel.deleteMany({}),
      ]);
    } else if (deptCount > 0 && empCount > 0 && userCount > 0) {
      console.log('[StaffSync Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[StaffSync Seed] Seeding initial HRMS data into MongoDB...');

    // 1. Departments
    if (force || deptCount === 0) {
      await DepartmentModel.insertMany(INITIAL_DEPARTMENTS);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_DEPARTMENTS.length} departments.`);
    }

    // 2. Employees
    if (force || empCount === 0) {
      await EmployeeModel.insertMany(INITIAL_EMPLOYEES);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_EMPLOYEES.length} employees.`);
    }

    // 3. Attendance
    const attCount = await AttendanceModel.countDocuments();
    if (force || attCount === 0) {
      await AttendanceModel.insertMany(INITIAL_ATTENDANCE);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_ATTENDANCE.length} attendance records.`);
    }

    // 4. Leaves
    const leaveCount = await LeaveModel.countDocuments();
    if (force || leaveCount === 0) {
      await LeaveModel.insertMany(INITIAL_LEAVE_REQUESTS);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_LEAVE_REQUESTS.length} leave requests.`);
    }

    // 5. Payroll
    const payrollCount = await PayrollModel.countDocuments();
    if (force || payrollCount === 0) {
      await PayrollModel.insertMany(INITIAL_PAYROLL);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_PAYROLL.length} payroll records.`);
    }

    // 6. Activities
    const actCount = await ActivityModel.countDocuments();
    if (force || actCount === 0) {
      await ActivityModel.insertMany(INITIAL_ACTIVITIES);
      console.log(`[StaffSync Seed] Seeded ${INITIAL_ACTIVITIES.length} activities.`);
    }

    // 7. Users
    if (force || userCount === 0) {
      const demoUsers = [
        {
          id: 'usr-1',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@staffsync.corp',
          password: hashPassword('password123'),
          role: 'Admin',
          jobTitle: 'VP of People & Culture',
          avatar: '/src/assets/images/avatar_admin_sarah_1792426921270.jpg',
          department: 'People Operations',
        },
        {
          id: 'usr-2',
          name: 'David Chen',
          email: 'david.chen@staffsync.corp',
          password: hashPassword('password123'),
          role: 'Manager',
          jobTitle: 'Principal Staff Engineer',
          avatar: '/src/assets/images/avatar_employee_david_1792426921583.jpg',
          department: 'Engineering',
        },
        {
          id: 'usr-3',
          name: 'Maya Lin',
          email: 'maya.lin@staffsync.corp',
          password: hashPassword('password123'),
          role: 'Employee',
          jobTitle: 'Lead Product Designer',
          avatar: '',
          department: 'Product & Design',
        },
      ];
      await UserModel.insertMany(demoUsers);
      console.log(`[StaffSync Seed] Seeded ${demoUsers.length} system users.`);
    }

    console.log('[StaffSync Seed] Database seeding completed successfully.');
  } catch (error: any) {
    console.error('[StaffSync Seed] Seeding error:', error.message);
  }
}
