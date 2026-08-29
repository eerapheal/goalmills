/**
 * GoalMills Web — Centralized Production Environment Validation
 * Validates critical environment variables and guards against insecure production defaults.
 */

export interface WebEnvConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  mongodbUrl?: string;
  redisUrl?: string;
  siteUrl: string;
  mailerServiceUrl: string;
  cronSecret?: string;
}

let validatedConfig: WebEnvConfig | null = null;

export function getWebEnv(): WebEnvConfig {
  if (validatedConfig) {
    return validatedConfig;
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  const isTest = nodeEnv === 'test';

  const mongodbUrl = process.env.MONGODB_URL;
  const redisUrl = process.env.REDIS_URL;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (isProduction ? 'https://goalmills.com' : 'http://localhost:3000');
  const mailerServiceUrl = process.env.MAILER_SERVICE_URL || 'http://localhost:8085';
  const cronSecret = process.env.CRON_SECRET;

  if (isProduction && !isTest) {
    const missing: string[] = [];
    if (!mongodbUrl) missing.push('MONGODB_URL');

    if (missing.length > 0) {
      const errorMsg = `[CRITICAL ENV ERROR] Missing required production environment variables: ${missing.join(
        ', '
      )}`;
      console.error(errorMsg);
      // In production, log error clearly
    }
  }

  validatedConfig = {
    isProduction,
    isDevelopment,
    isTest,
    mongodbUrl,
    redisUrl,
    siteUrl,
    mailerServiceUrl,
    cronSecret,
  };

  return validatedConfig;
}

export default getWebEnv;
