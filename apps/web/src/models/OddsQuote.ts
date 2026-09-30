import mongoose from 'mongoose';
import { OddsQuote as IOddsQuote } from '@goalmills/types';

const OddsQuoteSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    bookmakerId: {
      type: String,
      required: true,
      index: true,
    },
    bookmakerName: {
      type: String,
      required: true,
    },
    marketType: {
      type: String,
      required: true,
      enum: [
        '1X2',
        'DOUBLE_CHANCE',
        'OVER_UNDER',
        'BTTS',
        'ASIAN_HANDICAP',
        'EUROPEAN_HANDICAP',
        'CORRECT_SCORE',
        'CORNERS',
        'CARDS',
        'GOALSCORER',
        'CUSTOM',
      ],
      index: true,
    },
    selection: {
      type: String,
      required: true,
      enum: [
        'HOME',
        'DRAW',
        'AWAY',
        'HOME_OR_DRAW',
        'HOME_OR_AWAY',
        'DRAW_OR_AWAY',
        'OVER',
        'UNDER',
        'YES',
        'NO',
        'CUSTOM',
      ],
      index: true,
    },
    selectionLabel: {
      type: String,
      required: true,
    },
    line: {
      type: Number,
    },
    odds: {
      type: Number,
      required: true,
    },
    formattedOdds: {
      type: String,
    },
    oddsFormat: {
      type: String,
      enum: ['DECIMAL', 'FRACTIONAL', 'AMERICAN'],
      default: 'DECIMAL',
    },
    provider: {
      type: String,
      default: 'ALLSPORTS',
      index: true,
    },
    providerQuoteId: {
      type: String,
    },
    isBestOdds: {
      type: Boolean,
      default: false,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast odds comparison & best odds evaluation
OddsQuoteSchema.index({ eventId: 1, marketType: 1, selection: 1, odds: -1 });
OddsQuoteSchema.index({ eventId: 1, bookmakerId: 1 });

// Automatic TTL expiration for raw snapshots (7 days retention)
OddsQuoteSchema.index({ capturedAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.OddsQuote ||
  mongoose.model<IOddsQuote>('OddsQuote', OddsQuoteSchema);
