import mongoose, { Schema, Document, Model } from 'mongoose';
import type { HistoricalMatchRecord } from '@goalmills/types';

export interface IHistoricalMatch extends Omit<HistoricalMatchRecord, '_id'>, Document {}

const HistoricalMatchSchema: Schema = new Schema(
  {
    matchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sport: {
      type: String,
      required: true,
      enum: ['football', 'cricket', 'basketball', 'tennis'],
      index: true,
    },
    competition: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, index: true },
      country: { type: String },
      season: { type: String, required: true, index: true },
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: 'finished',
      index: true,
    },
    homeTeam: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      shortName: { type: String },
      slug: { type: String, required: true, index: true },
      logo: { type: String },
    },
    awayTeam: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      shortName: { type: String },
      slug: { type: String, required: true, index: true },
      logo: { type: String },
    },
    finalScore: {
      home: { type: Number, required: true },
      away: { type: Number, required: true },
      formatted: { type: String, required: true },
      halftime: {
        home: { type: Number },
        away: { type: Number },
      },
      extraTime: {
        home: { type: Number },
        away: { type: Number },
      },
      penalties: {
        home: { type: Number },
        away: { type: Number },
      },
      cricketInnings: {
        type: Schema.Types.Mixed,
      },
      basketballQuarters: {
        type: Schema.Types.Mixed,
      },
    },
    events: [
      {
        minute: { type: Schema.Types.Mixed },
        type: { type: String, required: true },
        teamSlug: { type: String },
        player: { type: String, required: true },
        assist: { type: String },
        detail: { type: String },
      },
    ],
    lineups: {
      type: Schema.Types.Mixed,
    },
    venue: { type: String },
    referee: { type: String },
    provenance: {
      provider: { type: String, required: true },
      providerId: { type: String, required: true },
      ingestedAt: { type: String, required: true },
      normalizationVersion: { type: String, required: true },
      confidenceScore: { type: Number, default: 1.0 },
    },
    tenantSlug: {
      type: String,
      default: 'goalmills',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'historical_matches',
  }
);

// Compound indexes for analytical queries & deduplication
HistoricalMatchSchema.index({ sport: 1, 'competition.slug': 1, date: -1 });
HistoricalMatchSchema.index({ 'homeTeam.slug': 1, 'awayTeam.slug': 1, date: -1 });
HistoricalMatchSchema.index({ 'provenance.provider': 1, 'provenance.providerId': 1 });

export const HistoricalMatch: Model<IHistoricalMatch> =
  mongoose.models.HistoricalMatch ||
  mongoose.model<IHistoricalMatch>('HistoricalMatch', HistoricalMatchSchema);

export default HistoricalMatch;
