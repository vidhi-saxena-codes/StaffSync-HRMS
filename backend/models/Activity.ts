import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'employee' | 'leave' | 'attendance' | 'payroll' | 'system';
  actorName: string;
  actorAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: String, default: 'Just now' },
    category: {
      type: String,
      enum: ['employee', 'leave', 'attendance', 'payroll', 'system'],
      default: 'system',
    },
    actorName: { type: String, default: 'System' },
    actorAvatar: { type: String, default: '' },
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

export const ActivityModel =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
