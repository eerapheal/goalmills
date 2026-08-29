import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, any>;
  topic: string;
  targetPlatform?: 'all' | 'android' | 'ios' | 'web';
  deliveryStats?: {
    totalSent: number;
    successCount: number;
    failureCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    topic: {
      type: String,
      default: 'all',
      index: true,
    },
    targetPlatform: {
      type: String,
      enum: ['all', 'android', 'ios', 'web'],
      default: 'all',
    },
    deliveryStats: {
      totalSent: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during Next.js hot reload
const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
