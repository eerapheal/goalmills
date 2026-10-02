import type { UserRole } from '@goalmills/types';

export interface UserIdentity {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  token?: string;
  expiresAt: Date;
}
