/**
 * GoalMills Social Engine — MatchSchedule Model
 *
 * Tracks the current lifecycle state of each match being monitored.
 * Used by matchTracker.ts to detect HT/FT state transitions.
 */

import mongoose from 'mongoose';

const MatchScheduleSchema = new mongoose.Schema(
  {
    /** AllSportsAPI event_key */
    matchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /** Current lifecycle state */
    currentState: {
      type: String,
      enum: [
        'UPCOMING',
        'FIRST_HALF',
        'HALFTIME',
        'SECOND_HALF',
        'FULLTIME',
        'EXTRA_TIME',
        'PENALTIES',
        'POSTPONED',
        'CANCELLED',
        'UNKNOWN',
      ],
      default: 'UPCOMING',
      index: true,
    },

    /** AllSportsAPI league_key */
    leagueId: {
      type: String,
      index: true,
    },

    /** League name */
    leagueName: String,

    /** Team names */
    homeTeam: String,
    awayTeam: String,

    /** Match date and time from API */
    eventDate: String,
    eventTime: String,

    /** Current score (e.g., "2 - 1") */
    score: String,

    /** Half-time score */
    halfTimeScore: String,

    /** Last time this record was updated */
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    /** Whether HT scorecard was already posted */
    htScorecardPosted: {
      type: Boolean,
      default: false,
    },

    /** Whether FT scorecard was already posted */
    ftScorecardPosted: {
      type: Boolean,
      default: false,
    },

    /** Whether post-match report was already posted */
    postMatchPosted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index: auto-delete records older than 7 days
MatchScheduleSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.models.MatchSchedule ||
  mongoose.model('MatchSchedule', MatchScheduleSchema);
