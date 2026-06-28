import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  specialty: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  reviewsCount: number;
  description: string;
  isAvailable: boolean;
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  image: { type: String, default: '/images/default-doctor.jpg' },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);