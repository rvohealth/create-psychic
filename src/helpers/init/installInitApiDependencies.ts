import addCmdForPackageManager from '../packageManager/addCmdForPackageManager.js'
import { InitPsychicAppCliOptions } from '../newPsychicApp.js'
import sspawn from '../sspawn.js'

export default async function installInitApiDependencies(options: InitPsychicAppCliOptions) {
  const baseDevDeps = [
    '@eslint/js',
    '@rvoh/dream-spec-helpers',
    '@rvoh/dream-spec-helpers',
    '@types/node',
    '@types/pg',
    '@types/supertest',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'cross-env',
    'eslint',
    'kysely-codegen',
    'luxon-jest-matchers',
    'openapi-typescript',
    'prettier',
    'supertest',
    'tsc-alias',
    'tsx',
    'tsx',
    'typescript-eslint',
    'vitest',
  ]
  const psychicDevDeps = [
    '@pollyjs/adapter-fetch',
    '@pollyjs/adapter-node-http',
    '@pollyjs/core',
    '@pollyjs/persister-fs',
    '@rvoh/psychic-spec-helpers',
    '@types/express',
    'expect-playwright',
    'nodemon',
    'puppeteer',
  ]
  const devDepsArr = options.dreamOnly ? baseDevDeps : [...baseDevDeps, ...psychicDevDeps]
  const devDeps = devDepsArr.join(' ')

  const baseDeps = [
    '@bull-board/express',
    '@rvoh/dream',

    // need to hold commander to 12.1.0 until dream bumps up, since
    // this will otherwise cause type errors at build
    'commander@12.1.0',

    'dotenv',
    'kysely',
    'pg',
    'pluralize-esm',
    'typescript',
  ]
  const psychicDeps = ['@rvoh/psychic', 'express-winston', 'express', 'winston']
  const depsArr = options.dreamOnly ? baseDeps : [...baseDeps, ...psychicDeps]

  if (options.workers || options.websockets) depsArr.push('ioredis')

  if (options.workers) depsArr.push('@rvoh/psychic-workers', 'bullmq')
  if (options.websockets)
    depsArr.push(
      '@rvoh/psychic-websockets',
      '@socket.io/redis-adapter',
      '@socket.io/redis-emitter',
      'socket.io',
      'socket.io-adapter',
    )
  const deps = depsArr.join(' ')

  const cmd = addCmdForPackageManager(options.packageManager) + ' '
  const devCmd = addCmdForPackageManager(options.packageManager, { dev: true })
  const prefix = process.env.CREATE_PSYCHIC_CORE_TEST === '1' ? 'cd howyadoin && ' : ''

  await sspawn(prefix + cmd + deps)
  await sspawn(prefix + devCmd + devDeps)
}
