import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[ key ];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),

  twilio: {
    accountSid: requireEnv('TWILIO_ACCOUNT_SID'),
    authToken: requireEnv('TWILIO_AUTH_TOKEN'),
    whatsappFrom: requireEnv('TWILIO_WHATSAPP_FROM'),
    smsFrom: requireEnv('TWILIO_SMS_FROM'),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),  // 1 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX ?? '30', 10),
  },

  auth: {
    jwtSecret: requireEnv('AUTH_SECRET'),
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  },

  env: process.env.NODE_ENV ?? 'development',

  allowedOrigins: JSON.parse(requireEnv('ALLOWED_ORIGINS')),

  admin: {
    email: requireEnv('ADMIN_EMAIL'),
    password: requireEnv('ADMIN_PASSWORD'),
  },

  lockout: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS ?? '5', 10),
    lockoutDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS ?? '900000', 10),  // 15 min
  },

} as const;
