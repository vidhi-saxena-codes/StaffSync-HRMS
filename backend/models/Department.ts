import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  id: string;
  name: string;
  code: string;
  description: string;
  headName: string;
  headAvatar?: string;
  budget: number;
  openPositions: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    headName: { type: String, default: '' },
    headAvatar: { type: String, default: '' },
    budget: { type: Number, default: 0 },
    openPositions: { type: Number, default: 0 },
    color: { type: String, default: 'indigo' },
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

export const DepartmentModel =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
