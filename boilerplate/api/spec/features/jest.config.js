/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  preset: 'jest-puppeteer',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/dream/src'],
  setupFilesAfterEnv: ['<rootDir>/setup/hooks.ts'],
}
