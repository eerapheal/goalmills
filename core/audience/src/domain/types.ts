import type { EmailValidationResult, SuppressionReason } from '@goalmills/types';

export type SubscriberStatus =
  | 'PENDING_CONFIRMATION'
  | 'ACTIVE'
  | 'UNSUBSCRIBED'
  | 'SUPPRESSED'
  | 'HARD_BOUNCE'
  | 'COMPLAINT';

export interface SubscriberProfile {
  id: string;
  email: string;
  emailNormalized: string;
  status: SubscriberStatus;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  emailHealthScore: number;
  reputationRiskScore: number;
  preferences?: {
    frequency?: 'daily' | 'weekly';
    sports?: string[];
    topics?: string[];
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationTokenPayload {
  email: string;
  timestamp: number;
  action: 'opt_in' | 'unsubscribe' | 'manage_preferences';
}

export type { EmailValidationResult, SuppressionReason };
