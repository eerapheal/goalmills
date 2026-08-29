import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      default: 'Sports Media & Social Media Content Officer',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      default: 'Editorial & Digital Media',
    },
    workArrangement: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Office'],
      default: 'Remote',
    },
    reportsTo: {
      type: String,
      default: 'Ekpenisi Erue Raphael (Founder / Managing Editor)',
    },
    startDate: {
      type: String,
      required: true,
      default: '2026-09-01',
    },
    trainingEndDate: {
      type: String,
      required: true,
      default: '2026-09-30',
    },
    status: {
      type: String,
      enum: ['training', 'probation', 'active', 'review', 'suspended', 'resigned', 'terminated'],
      default: 'training',
    },
    trainingAllowance: {
      type: Number,
      default: 30000,
    },
    startingSalary: {
      type: Number,
      default: 50000,
    },
    currentSalary: {
      type: Number,
      default: 30000,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    appointmentSigned: {
      type: Boolean,
      default: false,
    },
    appointmentSignedAt: {
      type: String,
    },
    employeeSignature: {
      type: String,
    },
    companySignature: {
      type: String,
      default: 'Ekpenisi Erue Raphael',
    },
    companyRepresentative: {
      type: String,
      default: 'Ekpenisi Erue Raphael',
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    socialHandles: {
      twitter: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      linkedin: { type: String },
      tiktok: { type: String },
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
