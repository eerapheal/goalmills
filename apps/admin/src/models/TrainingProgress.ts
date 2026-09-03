import mongoose from 'mongoose';

const TrainingProgressSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      unique: true,
    },
    // 30-Day Mandatory Training Curriculum Tracking
    completedDays: [{ type: Number, min: 1, max: 30 }],
    completedDaysCount: {
      type: Number,
      default: 0,
    },
    mandatoryDaysTotal: {
      type: Number,
      default: 30,
    },
    dailyRecords: [
      {
        day: { type: Number, required: true },
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyReport' },
        score: { type: Number, min: 0, max: 100 },
        status: {
          type: String,
          enum: ['pending', 'approved', 'revision', 'retraining'],
          default: 'pending',
        },
        gradedAt: { type: String },
      },
    ],
    // Legacy modules for backward compatibility
    modules: [
      {
        moduleId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['not_started', 'in_progress', 'submitted', 'completed'],
          default: 'not_started',
        },
        completedTasks: [{ type: String }],
        submissionLinks: [{ type: String }],
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String },
        completedAt: { type: String },
      },
    ],
    overallProgressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalAssessmentCompleted: {
      type: Boolean,
      default: false,
    },
    finalAssessmentScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    finalAssessmentNotes: {
      type: String,
    },
    isCertified: {
      type: Boolean,
      default: false,
    },
    certificationTier: {
      type: String,
    },
    certificationDate: {
      type: String,
    },
    transitionRecommended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TrainingProgress ||
  mongoose.model('TrainingProgress', TrainingProgressSchema);
