import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Manager' | 'Employee';
  jobTitle: string;
  avatar: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
    jobTitle: { type: String, default: 'Staff Member' },
    avatar: { type: String, default: '' },
    department: { type: String, default: 'General' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
