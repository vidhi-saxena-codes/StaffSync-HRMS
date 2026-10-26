import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
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
  role: 'Admin' | 'Manager' | 'Employee';
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  salary: number;
  location: string;
  managerName?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeCode: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    departmentId: { type: String, default: '' },
    departmentName: { type: String, default: 'General' },
    jobTitle: { type: String, default: 'Specialist' },
    role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
      default: 'Full-Time',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Terminated'],
      default: 'Active',
    },
    joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    salary: { type: Number, default: 0 },
    location: { type: String, default: 'Headquarters' },
    managerName: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const EmployeeModel =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
