import mongoose from 'mongoose';

const TrainingProgressSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      unique: true,
    },
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
    transitionRecommended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TrainingProgress ||
  mongoose.model('TrainingProgress', TrainingProgressSchema);
