import mongoose, { Schema, Document, Model } from 'mongoose';
import type { HistoricalTeamRecord } from '@goalmills/types';

export interface IHistoricalTeam extends Omit<HistoricalTeamRecord, '_id'>, Document {}

const HistoricalTeamSchema: Schema = new Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    sport: {
      type: String,
      required: true,
      index: true,
    },
    logo: {
      type: String,
    },
    country: {
      type: String,
    },
    founded: {
      type: Number,
    },
    stadium: {
      type: String,
    },
    manager: {
      type: String,
    },
    stats: {
      matchesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      goalsScored: { type: Number, default: 0 },
      goalsConceded: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 },
      recentForm: [{ type: String }],
    },
    lastUpdated: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
    collection: 'historical_teams',
  }
);

HistoricalTeamSchema.index({ sport: 1, slug: 1 }, { unique: true });

export const HistoricalTeam: Model<IHistoricalTeam> =
  mongoose.models.HistoricalTeam ||
  mongoose.model<IHistoricalTeam>('HistoricalTeam', HistoricalTeamSchema);

export default HistoricalTeam;
