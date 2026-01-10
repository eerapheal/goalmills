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
  event_key: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
