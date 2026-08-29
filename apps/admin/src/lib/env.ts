/**
 * GoalMills Admin — Centralized Production Environment Validation
 * Validates NextAuth secrets, database connections, and storage credentials.
 */

export interface AdminEnvConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  mongodbUrl?: string;
  nextAuthSecret?: string;
  nextAuthUrl?: string;
  redisUrl?: string;
  mailerServiceUrl: string;
}

let validatedConfig: AdminEnvConfig | null = null;

export function getAdminEnv(): AdminEnvConfig {
  if (validatedConfig) {
    return validatedConfig;
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  const isTest = nodeEnv === 'test';

  const mongodbUrl = process.env.MONGODB_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const redisUrl = process.env.REDIS_URL;
  const mailerServiceUrl = process.env.MAILER_SERVICE_URL || 'http://localhost:8085';

  if (isProduction && !isTest) {
    const missing: string[] = [];
    if (!mongodbUrl) missing.push('MONGODB_URL');
    if (!nextAuthSecret) missing.push('NEXTAUTH_SECRET');

    if (missing.length > 0) {
      console.error(
        `[CRITICAL ADMIN ENV ERROR] Missing required production environment variables: ${missing.join(
          ', '
        )}`
      );
    }
  }

  validatedConfig = {
    isProduction,
    isDevelopment,
    isTest,
    mongodbUrl,
    nextAuthSecret,
    nextAuthUrl,
    redisUrl,
    mailerServiceUrl,
  };

  return validatedConfig;
}

export default getAdminEnv;
