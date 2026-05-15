import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/migrations/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
    '!src/migrations/**',
    '!src/config/database.ts',
  ],
  setupFilesAfterFramework: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  restoreMocks: true,
};

export default config;
