import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
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
  readTime: {
    type: Number,
    default: 3,
  },
  category: {
    type: String,
    default: 'General',
  },
}, { timestamps: true });

export default mongoose.models.News || mongoose.model('News', NewsSchema);
