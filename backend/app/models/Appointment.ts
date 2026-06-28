import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  trackingCode: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
  referrer: {
    type: String,
    enum: ['self', 'other'],
    default: 'self',
  },
  referrerName: { type: String },
  referrerPhone: { type: String },
}, {
  timestamps: true,
});

// ✅ اینجا دیگه هیچ pre('save') ای نداریم!
// خودمون توی API trackingCode رو میسازیم

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);