import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  avatar: string;
  departmentName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  status: 'Present' | 'Late' | 'Half-Day' | 'Absent' | 'On Leave';
  workLocation: 'Office' | 'Remote' | 'Hybrid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    id: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, default: '' },
    avatar: { type: String, default: '' },
    departmentName: { type: String, default: '' },
    date: { type: String, required: true, index: true },
    checkInTime: { type: String, default: '' },
    checkOutTime: { type: String, default: '' },
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'],
      default: 'Present',
    },
    workLocation: {
      type: String,
      enum: ['Office', 'Remote', 'Hybrid'],
      default: 'Office',
    },
    notes: { type: String, default: '' },
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

export const AttendanceModel =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
