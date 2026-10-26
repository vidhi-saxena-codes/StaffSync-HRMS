import mongoose, { Schema, Document } from 'mongoose';

export interface ILeave extends Document {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatar: string;
  departmentName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Casual' | 'Unpaid';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, default: '' },
    avatar: { type: String, default: '' },
    departmentName: { type: String, default: '' },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Maternity/Paternity', 'Casual', 'Unpaid'],
      default: 'Annual',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    daysCount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    appliedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    reviewedBy: { type: String, default: '' },
    reviewedDate: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
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

export const LeaveModel =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);
