/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleNameMapper: {
    '^app/(.*)': '<rootDir>../../src/app/$1',
    '^conf/(.*)': '<rootDir>../../src/conf/$1',
    '^.howl/(.*)': '<rootDir>../../src/.howl/$1',
  },
  setupFiles: [ 'jest-plugin-context/setup' ],
  setupFilesAfterEnv: [ '<rootDir>setup/hooks.ts' ],
  globalSetup: '<rootDir>/setup/globalSetup.ts',
  globalTeardown: '<rootDir>setup/globalTeardown.ts',
}
