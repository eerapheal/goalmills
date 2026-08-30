import mongoose, { Schema, Document, Model } from 'mongoose';
import type { HistoricalStandingsRecord } from '@goalmills/types';

export interface IHistoricalStandings extends Omit<HistoricalStandingsRecord, '_id'>, Document {}

const HistoricalStandingsSchema: Schema = new Schema(
  {
    sport: {
      type: String,
      required: true,
      index: true,
    },
    competitionId: {
      type: String,
      required: true,
    },
    competitionName: {
      type: String,
      required: true,
    },
    competitionSlug: {
      type: String,
      required: true,
      index: true,
    },
    season: {
      type: String,
      required: true,
      index: true,
    },
    table: [
      {
        rank: { type: Number, required: true },
        teamId: { type: String, required: true },
        teamName: { type: String, required: true },
        teamSlug: { type: String, required: true },
        teamLogo: { type: String },
        played: { type: Number, required: true },
        won: { type: Number, required: true },
        drawn: { type: Number, required: true },
        lost: { type: Number, required: true },
        goalsFor: { type: Number, required: true },
        goalsAgainst: { type: Number, required: true },
        goalDiff: { type: Number, required: true },
        points: { type: Number, required: true },
        form: [{ type: String }],
      },
    ],
    lastUpdated: {
      type: String,
      required: true,
    },
    provenance: {
      provider: { type: String, required: true },
      providerId: { type: String, required: true },
      ingestedAt: { type: String, required: true },
      normalizationVersion: { type: String, required: true },
      confidenceScore: { type: Number, default: 1.0 },
    },
  },
  {
    timestamps: true,
    collection: 'historical_standings',
  }
);

HistoricalStandingsSchema.index({ sport: 1, competitionSlug: 1, season: 1 }, { unique: true });

export const HistoricalStandings: Model<IHistoricalStandings> =
  mongoose.models.HistoricalStandings ||
  mongoose.model<IHistoricalStandings>('HistoricalStandings', HistoricalStandingsSchema);

export default HistoricalStandings;
