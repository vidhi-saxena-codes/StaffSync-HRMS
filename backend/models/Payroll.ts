import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  jobTitle: string;
  avatar: string;
  payPeriod: string;
  baseSalary: number;
  allowances: number;
  bonuses: number;
  taxDeduction: number;
  healthInsurance: number;
  pension401k: number;
  netPay: number;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, default: '' },
    departmentName: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    avatar: { type: String, default: '' },
    payPeriod: { type: String, required: true },
    baseSalary: { type: Number, required: true, default: 0 },
    allowances: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    pension401k: { type: Number, default: 0 },
    netPay: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['Paid', 'Processing', 'Pending'],
      default: 'Pending',
    },
    paymentDate: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Direct Deposit' },
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

export const PayrollModel =
  mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
