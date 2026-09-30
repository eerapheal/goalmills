import mongoose from 'mongoose';
import { EventProviderMapping as IEventProviderMapping } from '@goalmills/types';

const EventProviderMappingSchema = new mongoose.Schema(
  {
    goalMillsEventId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
    },
    providerEventId: {
      type: String,
      required: true,
      index: true,
    },
    sport: {
      type: String,
      default: 'football',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'DISPUTED'],
      default: 'ACTIVE',
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

EventProviderMappingSchema.index(
  { goalMillsEventId: 1, provider: 1 },
  { unique: true }
);

EventProviderMappingSchema.index(
  { provider: 1, providerEventId: 1 }
);

export default mongoose.models.EventProviderMapping ||
  mongoose.model<IEventProviderMapping>('EventProviderMapping', EventProviderMappingSchema);
