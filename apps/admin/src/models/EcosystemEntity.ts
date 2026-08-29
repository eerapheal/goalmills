import mongoose from 'mongoose';

export type EcosystemEntityType = 'sport' | 'competition' | 'club' | 'player';

export interface IEcosystemEntity {
  _id?: string;
  type: EcosystemEntityType;
  name: string;
  slug: string;
  shortName?: string;
  sportSlug?: string;
  sportName?: string;
  competitionSlug?: string;
  competitionName?: string;
  clubSlug?: string;
  clubName?: string;
  country?: string;
  logo?: string;
  photo?: string;
  position?: string;
  nationality?: string;
  number?: number;
  marketValue?: string;
  description?: string;
  isFeatured?: boolean;
  tier?: number;
  order?: number;
  isCustom?: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const EcosystemEntitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Entity type is required (sport, competition, club, player)'],
      enum: ['sport', 'competition', 'club', 'player'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Entity name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Entity slug is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    sportSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    sportName: {
      type: String,
      trim: true,
    },
    competitionSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    competitionName: {
      type: String,
      trim: true,
    },
    clubSlug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    clubName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    number: {
      type: Number,
    },
    marketValue: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tier: {
      type: Number,
      default: 1,
    },
    order: {
      type: Number,
      default: 0,
    },
    isCustom: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

// Unique compound index on type + slug
EcosystemEntitySchema.index({ type: 1, slug: 1 }, { unique: true });

export default mongoose.models.EcosystemEntity ||
  mongoose.model('EcosystemEntity', EcosystemEntitySchema);
