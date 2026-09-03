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
    trainingDay: {
      type: Number,
      min: 1,
      max: 30,
    },
    lessonStudied: {
      type: String,
    },
    // Direct submission links per the curriculum Google Form
    articleUrl: { type: String },
    instagramUrl: { type: String },
    facebookUrl: { type: String },
    xUrl: { type: String },
    tiktokUrl: { type: String },
    youtubeUrl: { type: String },
    graphicUrl: { type: String },

    // Source verification trail
    source1: { type: String },
    source2: { type: String },

    // Structured reflections
    learnedTakeaway: { type: String }, // "What I learned"
    struggledWith: { type: String }, // "What I struggled with"
    improveTomorrow: { type: String }, // "What I will improve tomorrow"
    correctionsCompleted: { type: String },

    // Legacy/fallback arrays for multi-item reports
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

    // 10-category 100-point scorecard review
    scorecard: {
      research: { type: Number, min: 0, max: 15, default: 0 },
      accuracy: { type: Number, min: 0, max: 15, default: 0 },
      writing: { type: Number, min: 0, max: 15, default: 0 },
      seo: { type: Number, min: 0, max: 10, default: 0 },
      socialMedia: { type: Number, min: 0, max: 10, default: 0 },
      graphicDesign: { type: Number, min: 0, max: 10, default: 0 },
      creativity: { type: Number, min: 0, max: 10, default: 0 },
      publishingDiscipline: { type: Number, min: 0, max: 5, default: 0 },
      analyticsLearning: { type: Number, min: 0, max: 5, default: 0 },
      teamworkReporting: { type: Number, min: 0, max: 5, default: 0 },
    },
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    performanceRating: {
      type: String,
      enum: ['Excellent', 'Very Good', 'Good', 'Improvement Required', 'Remedial Training'],
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'revision', 'retraining', 'needs_revision'],
      default: 'pending',
    },
    editorScore: {
      type: Number,
      min: 0,
      max: 100,
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
