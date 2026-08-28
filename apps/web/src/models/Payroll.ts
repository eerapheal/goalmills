import mongoose from 'mongoose';

const PayrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      default: 'Sports Media & Social Media Content Officer',
    },
    period: {
      type: String,
      required: true, // e.g., 'September 2026'
    },
    paymentType: {
      type: String,
      enum: ['training_allowance', 'regular_salary', 'bonus', 'adjustment'],
      default: 'training_allowance',
    },
    baseAmount: {
      type: Number,
      required: true,
      default: 30000,
    },
    bonusAmount: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      required: true,
      default: 30000,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'processing', 'paid'],
      default: 'draft',
    },
    paymentDate: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: 'Bank Transfer',
    },
    referenceNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
