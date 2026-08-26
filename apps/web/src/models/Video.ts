import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  video_title: {
    type: String,
    required: [true, 'Please provide a video title'],
  },
  video_url: {
    type: String,
    required: [true, 'Please provide a video URL'],
  },
  video_thumbnail: {
    type: String,
    required: false,
  },
  video_description: {
    type: String,
    required: false,
  },
  event_key: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    default: 'Highlights',
  },
  league: {
    type: String,
    required: false,
  },
  duration: {
    type: String,
    required: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
