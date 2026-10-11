import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayerSeasonStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  cleanSheets?: number;
  passAccuracy: string;
  rating: number;
}

export interface IPlayer extends Document {
  name: string;
  slug: string;
  number: number;
  position: string;
  nationality: string;
  countryFlag?: string;
  africanOrigin: boolean;
  clubSlug: string;
  clubName: string;
  competitionSlug: string;
  photo: string;
  age: number;
  height: string;
  marketValue: string;
  contractUntil?: string;
  weeklyWage?: string;
  releaseClause?: string;
  agent?: string;
  marketValueTrend?: 'up' | 'down' | 'stable';
  bio: string;
  externalPlayerKey?: string;
  externalTeamKey?: string;
  seasonStats: IPlayerSeasonStats;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSeasonStatsSchema = new Schema<IPlayerSeasonStats>(
  {
    appearances: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 },
    passAccuracy: { type: String, default: '82%' },
    rating: { type: Number, default: 7.2 },
  },
  { _id: false }
);

const PlayerSchema = new Schema<IPlayer>(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Player slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    number: {
      type: Number,
      default: 9,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      default: 'Striker / Forward',
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required'],
      default: 'Nigeria',
      index: true,
    },
    countryFlag: {
      type: String,
      default: '⚽',
    },
    africanOrigin: {
      type: Boolean,
      default: true,
      index: true,
    },
    clubSlug: {
      type: String,
      required: [true, 'Club slug is required'],
      default: 'arsenal',
    },
    clubName: {
      type: String,
      required: [true, 'Club name is required'],
      default: 'Arsenal FC',
    },
    competitionSlug: {
      type: String,
      required: [true, 'Competition slug is required'],
      default: 'premier-league',
      index: true,
    },
    photo: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: 25,
    },
    height: {
      type: String,
      default: '184 cm',
    },
    marketValue: {
      type: String,
      default: '€50.00M',
    },
    contractUntil: {
      type: String,
      default: 'June 2028',
    },
    weeklyWage: {
      type: String,
      default: '€100,000',
    },
    releaseClause: {
      type: String,
      default: '€80.00M',
    },
    agent: {
      type: String,
      default: '',
    },
    marketValueTrend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'up',
    },
    bio: {
      type: String,
      default: '',
    },
    externalPlayerKey: {
      type: String,
      default: '',
    },
    externalTeamKey: {
      type: String,
      default: '',
    },
    seasonStats: {
      type: PlayerSeasonStatsSchema,
      default: () => ({
        appearances: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        cleanSheets: 0,
        passAccuracy: '82%',
        rating: 7.2,
      }),
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of existing model
const Player: Model<IPlayer> =
  mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);

export default Player;
