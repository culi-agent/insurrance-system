import dotenv from 'dotenv';

dotenv.config();

/**
 * Validates that all required environment variables are present.
 * Throws an error and prevents app startup if critical vars are missing.
 */
function validateRequiredEnvVars(): void {
  const required: string[] = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key] || process.env[key]!.trim() === '');

  if (missing.length > 0) {
    throw new Error(
      `[CONFIG ERROR] Missing required environment variables:\n` +
      missing.map((k) => `  - ${k}`).join('\n') +
      `\n\nPlease set these in your .env file or environment before starting the server.`
    );
  }

  // Validate JWT secrets are strong enough (min 32 chars)
  const jwtSecrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of jwtSecrets) {
    const value = process.env[key]!;
    if (value.length < 32) {
      throw new Error(
        `[CONFIG ERROR] ${key} must be at least 32 characters long for security. Current length: ${value.length}`
      );
    }
    // Reject known placeholder/default values
    const insecureDefaults = [
      'access-secret-key-change-in-production',
      'refresh-secret-key-change-in-production',
      'your-access-secret-key-min-32-chars',
      'your-refresh-secret-key-min-32-chars',
      'secret',
      'changeme',
    ];
    if (insecureDefaults.includes(value.toLowerCase())) {
      throw new Error(
        `[CONFIG ERROR] ${key} contains an insecure default value. Please use a strong, unique secret.`
      );
    }
  }
}

// Run validation immediately on import
validateRequiredEnvVars();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME: process.env.DB_NAME || 'insurance_system',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',

  // JWT - NO DEFAULT VALUES, validated above
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // OTP
  OTP_EXPIRES_IN: parseInt(process.env.OTP_EXPIRES_IN || '300', 10), // 5 minutes
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || '6', 10),

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // Account Lock
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  LOCK_DURATION_MINUTES: parseInt(process.env.LOCK_DURATION_MINUTES || '30', 10),

  // Email Provider
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'mock',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@insurance-system.vn',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Insurance System',

  // SMS Provider
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || '',
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Cookie
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
};
