import mongoose from 'mongoose';
import { BookmakerProviderMapping as IBookmakerProviderMapping } from '@goalmills/types';

const BookmakerProviderMappingSchema = new mongoose.Schema(
  {
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'BETLOY',
      index: true,
    },
    providerBookmakerId: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'ALL',
      index: true,
    },
    supportedMarkets: {
      type: [String],
      default: ['1X2', 'Over/Under', 'BTTS', 'Double Chance'],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'UNSUPPORTED'],
      default: 'ACTIVE',
      index: true,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

BookmakerProviderMappingSchema.index(
  { bookmakerId: 1, provider: 1 },
  { unique: true }
);

BookmakerProviderMappingSchema.index(
  { provider: 1, providerBookmakerId: 1 }
);

export default mongoose.models.BookmakerProviderMapping ||
  mongoose.model<IBookmakerProviderMapping>('BookmakerProviderMapping', BookmakerProviderMappingSchema);
