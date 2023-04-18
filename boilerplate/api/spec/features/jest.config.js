/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
  preset: 'jest-puppeteer',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleNameMapper: {
    '^app/(.*)': '<rootDir>../../src/app/$1',
    '^conf/(.*)': '<rootDir>../../src/conf/$1',
    '^.howl/(.*)': '<rootDir>../../src/.howl/$1',
  },
  setupFilesAfterEnv: [ 'jest-plugin-context/setup', '<rootDir>/setup/hooks.ts' ],
}
