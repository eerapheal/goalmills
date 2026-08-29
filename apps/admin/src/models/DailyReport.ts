import mongoose from 'mongoose';

const DailyReportSchema = new mongoose.Schema(
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
    reportDate: {
      type: String,
      required: true,
    },
    articles: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        category: { type: String, default: 'Football' },
        wordCount: { type: Number },
        sourcesVerified: { type: Boolean, default: true },
      },
    ],
    socialPosts: [
      {
        platform: {
          type: String,
          enum: ['X', 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'WhatsApp'],
          required: true,
        },
        url: { type: String, required: true },
        captionExcerpt: { type: String },
      },
    ],
    mediaAssets: [
      {
        type: {
          type: String,
          enum: ['canva_graphic', 'short_video', 'youtube_video', 'reel', 'thumbnail'],
          required: true,
        },
        title: { type: String, required: true },
        link: { type: String, required: true },
        previewUrl: { type: String },
      },
    ],
    sourcesUsed: [{ type: String }],
    engagementSummary: {
      type: String,
      default: '',
    },
    problemsEncountered: {
      type: String,
    },
    correctionsMade: {
      type: String,
    },
    lessonsLearned: {
      type: String,
    },
    tasksCompleted: {
      type: String,
      required: true,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'needs_revision'],
      default: 'pending',
    },
    editorScore: {
      type: Number,
      min: 1,
      max: 10,
    },
    editorFeedback: {
      type: String,
    },
    reviewedBy: {
      type: String,
    },
    reviewedAt: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.DailyReport || mongoose.model('DailyReport', DailyReportSchema);
