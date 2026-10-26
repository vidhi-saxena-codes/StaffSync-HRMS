# StaffSync — Modern HR Management System (HRMS)

StaffSync is an enterprise-grade full-stack HR Management System designed to manage organizational structures, employee lifecycle records, live attendance timesheets, leave workflows, and monthly payroll processing backed by **MongoDB** and **Mongoose**.

---

## 📁 Project Architecture & Organization

The project is organized into two distinct and modular folders within the single repository root:

```text
StaffSync/
│
├── frontend/
│   ├── src/                     # React 19 pages, components, context, and services
│   │   ├── components/          # Reusable UI widgets, layout, modal, and payroll components
│   │   ├── context/             # HRContext with live MongoDB API state synchronization
│   │   ├── pages/               # Employees, Departments, Attendance, Leave, Payroll, Login
│   │   ├── services/            # Type-safe API client (api.ts) with JWT authentication
│   │   └── types/               # TypeScript interfaces & types
│   ├── public/                  # Static assets & downloadable project archive
│   ├── index.html               # Frontend HTML root
│   ├── package.json             # Frontend dependencies & scripts
│   ├── tsconfig.json            # Frontend TypeScript configuration
│   └── vite.config.ts           # Vite bundler configuration with API reverse proxy
│
├── backend/
│   ├── models/                  # Mongoose Schemas & Models (Employee, Department, etc.)
│   ├── routes/                  # Express REST API routes & controllers
│   ├── db.ts                    # MongoDB connection with retry & auto-reconnect
│   ├── seed.ts                  # Database seeder with default corporate data
│   ├── server.ts                # Standalone Express API backend server (Port 5000)
│   ├── authHelper.ts            # PBKDF2/SHA-512 password hashing & HMAC-SHA256 JWT tokens
│   ├── package.json             # Backend dependencies & scripts
│   ├── tsconfig.json            # Backend TypeScript configuration
│   ├── .env                     # Backend environment configuration (git ignored)
│   └── .env.example             # Backend environment template
│
├── package.json                 # Root orchestration package.json
├── start-dev.mjs                # Unified concurrent runner for frontend + backend
├── README.md                    # Project documentation & reference
└── .gitignore                   # Security exclusion rules
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express 4, TypeScript (TSX execution engine)
- **Database & ODM**: MongoDB with Mongoose 9.x
- **Authentication**: JWT session tokens with PBKDF2/SHA-512 cryptographic password hashing
- **Fault-Tolerant Resilience**: Automatic seed mechanism & background auto-reconnect

---

## ✨ Core Features & Modules

1. **Executive Dashboard**:
   - Real-time KPI metric cards (Total employees, Active today, Departments, Attendance rate, Payroll total).
   - Weekly attendance distribution charts and department headcount visualizations.
   - Live audit & activity timeline stream.

2. **Employee Management**:
   - Comprehensive CRUD operations connected to MongoDB.
   - Filter by department, role, status, and employment type.
   - Automatic employee code generation (`STF-01XX`) and synchronized initial payroll profile creation.

3. **Department Governance**:
   - Full CRUD operations with budget allocation, open positions, department head assignment, and color tag styling.
   - Roster viewer for department-specific staff inspection.

4. **Time & Attendance Tracking**:
   - Interactive check-in / check-out terminal with live timer.
   - Work location selector (`Office`, `Remote`, `Hybrid`) and daily shift notes.
   - Date filter with quick "Today" and "Seed Data" toggles.
   - Attendance history with status indicators (`Present`, `Late`, `Half-Day`, `Absent`).

5. **Leave & Absence Management**:
   - Leave requests supporting `Annual`, `Sick`, `Maternity/Paternity`, `Casual`, and `Unpaid`.
   - Dynamic business day calculation.
   - Managerial review queue with one-click Approve / Reject and feedback note submission.

6. **Payroll & Compensation Engine**:
   - Statutory breakdown calculation (Federal tax, Health insurance, 401k pension).
   - Monthly disbursement processor with status tracking (`Paid`, `Processing`, `Pending`).
   - Printable / exportable corporate payslip generator.

7. **User Authentication & Role-Based Access**:
   - Secure login supporting credentials or quick-access role previewers:
     - **Admin**: Sarah Jenkins (`sarah.jenkins@staffsync.corp`)
     - **Manager**: David Chen (`david.chen@staffsync.corp`)
     - **Employee**: Maya Lin (`maya.lin@staffsync.corp`)
   - Default password for demo accounts: `password123`

---

## 📋 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health status and MongoDB connection diagnostics |
| `/api/auth/login` | `POST` | Authenticate user and issue session token |
| `/api/auth/me` | `GET` | Retrieve current authenticated user |
| `/api/employees` | `GET` | List all employees |
| `/api/employees/:id` | `GET` | Retrieve employee by ID |
| `/api/employees` | `POST` | Create a new employee |
| `/api/employees/:id` | `PUT` | Update employee record |
| `/api/employees/:id` | `DELETE` | Delete employee record |
| `/api/departments` | `GET` | List all departments |
| `/api/departments/:id` | `GET` | Retrieve department by ID |
| `/api/departments` | `POST` | Create a new department |
| `/api/departments/:id` | `PUT` | Update department details |
| `/api/departments/:id` | `DELETE` | Delete department |
| `/api/attendance` | `GET` | Query attendance records (filters: `date`, `employeeId`) |
| `/api/attendance/check-in` | `POST` | Clock in for the day |
| `/api/attendance/check-out` | `POST` | Clock out and calculate elapsed hours |
| `/api/attendance` | `POST` | Create manual timesheet record |
| `/api/attendance/:id` | `PUT` | Update attendance record |
| `/api/leaves` | `GET` | List all leave requests |
| `/api/leaves` | `POST` | Submit a leave request |
| `/api/leaves/:id` | `PUT` | Review (Approve/Reject) leave request |
| `/api/leaves/:id` | `DELETE` | Cancel / Delete leave request |
| `/api/payroll` | `GET` | List payroll records |
| `/api/payroll` | `POST` | Create payroll record |
| `/api/payroll/:id` | `PUT` | Update payroll status |
| `/api/payroll/:id` | `DELETE` | Delete payroll record |
| `/api/payroll/disburse-all` | `POST` | Disburse all pending payroll for current cycle |
| `/api/activities` | `GET` | Retrieve latest system activity events |
| `/api/stats` | `GET` | Retrieve calculated KPI summary statistics |
| `/api/reset-data` | `POST` | Restore database to pristine initial corporate dataset |

---

## 🚀 Getting Started & Execution

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

### 2. Configure Environment Variables
In `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync_hrms
JWT_SECRET=staffsync_secure_jwt_secret_key_2026_dev_prod
```

### 3. Install Dependencies
Run in the root folder:
```bash
npm install --legacy-peer-deps
```

### 4. Run Full-Stack (Frontend + Backend Concurrently)
Run from the root project folder:
```bash
npm run dev
```
- **Backend**: Runs on `http://localhost:5000`
- **Frontend**: Runs on `http://localhost:3000` (with automatic reverse proxy to backend)

### 5. Running Independently
- **Run Backend Only**:
  ```bash
  npm run dev:backend
  # or
  cd backend && npm run dev
  ```

- **Run Frontend Only**:
  ```bash
  npm run dev:frontend
  # or
  cd frontend && npm run dev
  ```

### 6. Build and Validation
```bash
npm run lint    # Runs TypeScript check on both backend and frontend
npm run build   # Compiles frontend production bundle
```

---

## 🔒 Security Best Practices
- Sensitive configuration files (`.env`, secrets, `.log`) are strictly excluded via `.gitignore`.
- Password hashes use PBKDF2 with SHA-512 and per-user cryptographic salts.
- Session tokens are signed using HMAC-SHA256 with expiration checks.
