import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    image: {
      type: String,
      required: [false, 'Please provide an image URL'],
    },
    author: {
      type: String,
      default: 'GoalMills Admin',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    readTime: {
      type: Number,
      default: 3,
    },
    category: {
      type: String,
      default: 'General',
    },
    categorySlug: {
      type: String,
      default: 'general',
    },
    source: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    relatedTeam: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.News || mongoose.model('News', NewsSchema);
