import mongoose from 'mongoose';
import { Bookmaker as IBookmaker } from '@goalmills/types';

const BookmakerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    legalName: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    countries: {
      type: [String],
      default: ['ALL'],
      index: true,
    },
    supportedSports: {
      type: [String],
      default: ['football'],
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'RESTRICTED'],
      default: 'ACTIVE',
      index: true,
    },
    externalProviderIds: {
      type: Map,
      of: String,
      default: {},
    },
    priorityRank: {
      type: Number,
      default: 100,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSponsored: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    bonusText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

BookmakerSchema.index({ status: 1, priorityRank: 1 });

export default mongoose.models.Bookmaker || mongoose.model<IBookmaker>('Bookmaker', BookmakerSchema);
