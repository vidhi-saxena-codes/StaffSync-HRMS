import {
  Employee,
  Department,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  ActivityItem,
  UserSession,
} from '../types';

const TOKEN_KEY = 'staffsync_auth_token';
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Health & Diagnostics
  health: () => request<{ status: string; database: string; recordCounts: any }>('/api/health'),

  // Authentication
  auth: {
    login: (credentials: { email?: string; password?: string; role?: string }) =>
      request<{ success: boolean; user: UserSession; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<{ user: UserSession }>('/api/auth/me'),
  },

  // Employees
  employees: {
    getAll: () => request<Employee[]>('/api/employees'),
    getById: (id: string) => request<Employee>(`/api/employees/${id}`),
    create: (emp: Omit<Employee, 'id' | 'employeeCode'>) =>
      request<Employee>('/api/employees', {
        method: 'POST',
        body: JSON.stringify(emp),
      }),
    update: (id: string, updates: Partial<Employee>) =>
      request<Employee>(`/api/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/employees/${id}`, {
        method: 'DELETE',
      }),
  },

  // Departments
  departments: {
    getAll: () => request<Department[]>('/api/departments'),
    create: (dept: Omit<Department, 'id'>) =>
      request<Department>('/api/departments', {
        method: 'POST',
        body: JSON.stringify(dept),
      }),
    update: (id: string, updates: Partial<Department>) =>
      request<Department>(`/api/departments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/departments/${id}`, {
        method: 'DELETE',
      }),
  },

  // Attendance
  attendance: {
    getAll: (params?: { date?: string; employeeId?: string }) => {
      const query = new URLSearchParams();
      if (params?.date) query.append('date', params.date);
      if (params?.employeeId) query.append('employeeId', params.employeeId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<AttendanceRecord[]>(`/api/attendance${qs}`);
    },
    create: (record: Omit<AttendanceRecord, 'id'>) =>
      request<AttendanceRecord>('/api/attendance', {
        method: 'POST',
        body: JSON.stringify(record),
      }),
    checkIn: (payload: {
      employeeId: string;
      employeeName: string;
      departmentName: string;
      avatar?: string;
      location?: 'Office' | 'Remote' | 'Hybrid';
      notes?: string;
    }) =>
      request<AttendanceRecord>('/api/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    checkOut: (payload: { employeeId: string }) =>
      request<AttendanceRecord>('/api/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, updates: Partial<AttendanceRecord>) =>
      request<AttendanceRecord>(`/api/attendance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
  },

  // Leaves
  leaves: {
    getAll: () => request<LeaveRequest[]>('/api/leaves'),
    create: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) =>
      request<LeaveRequest>('/api/leaves', {
        method: 'POST',
        body: JSON.stringify(leave),
      }),
    update: (id: string, updates: Partial<LeaveRequest>) =>
      request<LeaveRequest>(`/api/leaves/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/leaves/${id}`, {
        method: 'DELETE',
      }),
  },

  // Payroll
  payroll: {
    getAll: () => request<PayrollRecord[]>('/api/payroll'),
    create: (record: Omit<PayrollRecord, 'id'>) =>
      request<PayrollRecord>('/api/payroll', {
        method: 'POST',
        body: JSON.stringify(record),
      }),
    update: (id: string, updates: Partial<PayrollRecord>) =>
      request<PayrollRecord>(`/api/payroll/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/payroll/${id}`, {
        method: 'DELETE',
      }),
    disburseAll: () =>
      request<{ success: boolean; count: number; totalAmount?: number }>(
        '/api/payroll/disburse-all',
        { method: 'POST' }
      ),
  },

  // Activities
  activities: {
    getAll: () => request<ActivityItem[]>('/api/activities'),
    create: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) =>
      request<ActivityItem>('/api/activities', {
        method: 'POST',
        body: JSON.stringify(activity),
      }),
  },

  // Stats
  stats: {
    get: () =>
      request<{
        totalEmployees: number;
        activeToday: number;
        departments: number;
        attendanceRate: string;
        monthlyPayroll: string;
      }>('/api/stats'),
  },

  // Reset database
  resetData: () =>
    request<{ success: boolean; message: string }>('/api/reset-data', {
      method: 'POST',
    }),
};
