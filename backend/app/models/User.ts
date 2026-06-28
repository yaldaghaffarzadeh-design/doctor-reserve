import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  qrSecret: string | null;
  qrCode: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'نام کامل الزامی است'],
    trim: true,
    minlength: [3, 'نام باید حداقل ۳ کاراکتر باشد']
  },
  phone: {
    type: String,
    required: [true, 'شماره موبایل الزامی است'],
    unique: true,
    match: [/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است']
  },
  password: {
    type: String,
    required: [true, 'رمز عبور الزامی است'],
    minlength: [6, 'رمز عبور حداقل ۶ کاراکتر باشد']
  },
  qrSecret: {
    type: String,
    default: null
  },
  qrCode: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

UserSchema.index({ phone: 1 });
UserSchema.index({ qrSecret: 1 });

UserSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  await this.save();
};

UserSchema.methods.isLocked = function() {
  if (!this.lockedUntil) return false;
  return new Date() < this.lockedUntil;
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);