/**
 * Jest global setup file
 * Configures test environment variables and mocks
 */

// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests
process.env.OTP_EXPIRES_IN = '300';
process.env.OTP_LENGTH = '6';
process.env.MAX_LOGIN_ATTEMPTS = '5';
process.env.LOCK_DURATION_MINUTES = '30';

// Mock TypeORM DataSource
jest.mock('../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isInitialized: true,
  },
}));
