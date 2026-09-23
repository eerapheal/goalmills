import mongoose from 'mongoose';

const EntityRefSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    logo: { type: String },
    photo: { type: String },
  },
  { _id: false }
);

const RelatedMatchSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String },
    slug: { type: String },
    date: { type: String },
  },
  { _id: false }
);

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    slug: {
      type: String,
      index: true,
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
    authorSlug: {
      type: String,
      default: 'goalmills-editorial',
    },
    authorBio: {
      type: String,
    },
    authorPhoto: {
      type: String,
    },
    authorRole: {
      type: String,
      default: 'staff',
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
    sport: {
      type: String,
      default: 'Football',
    },
    sportSlug: {
      type: String,
      default: 'football',
      index: true,
    },
    competition: {
      type: String,
    },
    competitionSlug: {
      type: String,
      index: true,
    },
    competitionId: {
      type: mongoose.Schema.Types.Mixed,
    },
    teams: {
      type: [EntityRefSchema],
      default: [],
    },
    players: {
      type: [EntityRefSchema],
      default: [],
    },
    relatedMatch: {
      type: RelatedMatchSchema,
    },
    articleType: {
      type: String,
      default: 'news',
      index: true,
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
      index: true,
    },
    relatedTeam: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published'],
      default: 'published',
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-generate SEO slug from title if missing
NewsSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

export default mongoose.models.News || mongoose.model('News', NewsSchema);
