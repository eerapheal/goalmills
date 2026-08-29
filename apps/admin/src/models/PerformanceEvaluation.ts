import mongoose from 'mongoose';

const PerformanceEvaluationSchema = new mongoose.Schema(
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
    period: {
      type: String,
      required: true,
      default: '30-Day Training Assessment',
    },
    evaluationDate: {
      type: String,
      required: true,
    },
    evaluatorName: {
      type: String,
      required: true,
      default: 'Ekpenisi Erue Raphael',
    },
    evaluatorRole: {
      type: String,
      required: true,
      default: 'Founder / Managing Editor',
    },
    metrics: [
      {
        key: { type: String, required: true },
        name: { type: String, required: true },
        weight: { type: Number, required: true }, // e.g. 15 for 15%
        score: { type: Number, required: true, min: 0, max: 100 },
        notes: { type: String },
      },
    ],
    totalWeightedScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
      required: true,
    },
    strengths: {
      type: String,
      default: '',
    },
    areasForImprovement: {
      type: String,
      default: '',
    },
    transitionRecommendation: {
      type: String,
      enum: ['promote_to_regular', 'extend_training', 'renegotiate_salary', 'terminate'],
      default: 'promote_to_regular',
    },
    recommendedSalary: {
      type: Number,
      default: 50000,
    },
    managementDecision: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PerformanceEvaluation ||
  mongoose.model('PerformanceEvaluation', PerformanceEvaluationSchema);
