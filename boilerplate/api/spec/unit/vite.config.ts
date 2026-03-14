import '../../src/conf/loadEnv.js'

import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'
import srcPath from '../../src/conf/system/srcPath.js'

const decorators = defineRolldownBabelPreset({
  preset: () => ({
    plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
  }),
  rolldown: { filter: { code: '@' } },
})

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  plugins: [babel({ presets: [decorators] } as any)],
  resolve: {
    alias: {
      '@conf': srcPath('conf'),
      '@controllers': srcPath('app', 'controllers'),
      '@models': srcPath('app', 'models'),
      '@serializers': srcPath('app', 'serializers'),
      '@services': srcPath('app', 'services'),
      '@spec': srcPath('..', 'spec'),
      '@src': srcPath(),
    },
  },
  test: {
    dir: './spec/unit',
    globals: true,
    setupFiles: ['luxon-jest-matchers', './spec/unit/setup/hooks.js'],
    fileParallelism: true,
    maxConcurrency: parseInt(process.env.DREAM_PARALLEL_TESTS || '1'),
    maxWorkers: parseInt(process.env.DREAM_PARALLEL_TESTS || '1'),
    watch: false,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    printConsoleTrace: true,
    hookTimeout: 20000,
    testTimeout: 20000,

    globalSetup: './spec/unit/setup/globalSetup.js',
  },
})
