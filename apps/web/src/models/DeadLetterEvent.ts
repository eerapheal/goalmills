import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DeadLetterEventRecord } from '@goalmills/types';

export interface IDeadLetterEvent extends Omit<DeadLetterEventRecord, '_id'>, Document {}

const DeadLetterEventSchema: Schema = new Schema(
  {
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    tenantSlug: {
      type: String,
      required: true,
      default: 'goalmills',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    streamName: {
      type: String,
      required: true,
    },
    consumerGroup: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    stackTrace: {
      type: String,
    },
    attempts: {
      type: Number,
      required: true,
      default: 1,
    },
    failedAt: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'discarded', 'replayed'],
      default: 'pending',
      index: true,
    },
    replayedAt: {
      type: String,
    },
    resolvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'dead_letter_events',
  }
);

DeadLetterEventSchema.index({ tenantSlug: 1, status: 1, createdAt: -1 });
DeadLetterEventSchema.index({ eventType: 1, status: 1 });

export const DeadLetterEvent: Model<IDeadLetterEvent> =
  mongoose.models.DeadLetterEvent ||
  mongoose.model<IDeadLetterEvent>('DeadLetterEvent', DeadLetterEventSchema);

export default DeadLetterEvent;
