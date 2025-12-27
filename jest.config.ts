import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test configuration
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],

  // Coverage settings
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
    '!src/**/index.ts', // Barrel files
  ],

  // Coverage thresholds - aim for 85%
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Specific file thresholds for critical modules
    './src/lib/forecasting.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Reporters - using default only
  reporters: ['default'],

  // Performance
  maxWorkers: '50%',
  testTimeout: 10000,

  // Verbose output
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)

