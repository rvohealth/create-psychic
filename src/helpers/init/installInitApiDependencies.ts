import { InitPsychicAppCliOptions } from '../newPsychicApp.js'
import sspawn from '../sspawn.js'

export default async function installInitApiDependencies(options: InitPsychicAppCliOptions) {
  const baseDevDeps = ['@rvoh/dream-spec-helpers', 'tsx', 'vitest']
  const psychicDevDeps = ['@rvoh/psychic-spec-helpers']
  const devDepsArr = options.dreamOnly ? baseDevDeps : [...baseDevDeps, ...psychicDevDeps]
  const devDeps = devDepsArr.join(' ')

  const baseDeps = ['@rvoh/dream', 'dotenv', 'kysely', 'pg', 'pluralize-esm']
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
      'socket.io-adapter'
    )
  const deps = depsArr.join(' ')

  const cmd = options.packageManager === 'npm' ? 'npm install ' : `${options.packageManager} add `
  const devCmd =
    options.packageManager === 'npm' ? 'npm install --dev ' : `${options.packageManager} add --dev `
  const prefix = process.env.CREATE_PSYCHIC_CORE_TEST === '1' ? 'cd howyadoin && ' : ''

  await sspawn(prefix + cmd + deps)
  await sspawn(prefix + devCmd + devDeps)
}
