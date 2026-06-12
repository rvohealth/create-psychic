import { type PrimaryKeyType } from '@rvoh/dream/types'
import c from 'yoctocolors'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import addClientApp from './addClientApp.js'
import apiOnlyOptions from './apiOnlyOptions.js'
import gitInit from './gitInit.js'
import installPsychicSkill from './installPsychicSkill.js'
import logo from './logo.js'
import buildNewPsychicAppOptionsWithPrompt from './new/buildNewPsychicAppOptionsWithPrompt.js'
import copyApiBoilerplate from './new/copyApiBoilerplate.js'
import initialGitCommit from './new/initialGitCommit.js'
import installApiDependencies from './new/installApiDependencies.js'
import welcomeMessage from './new/welcomeMessage.js'
import sleep from './sleep.js'

export const cliClientAppTypes = ['nextjs', 'react', 'vue', 'nuxt', 'none'] as const

export const psychicPackageManagers = ['pnpm', 'yarn', 'npm'] as const
export const psychicRuntimes = ['node', 'deno', 'bun'] as const
export const initTemplates = ['none', 'nextjs'] as const
export const importExtensions = ['.js', '.ts', 'none'] as const
export type PsychicRuntime = (typeof psychicRuntimes)[number]
// The runtimes OFFERED to the user. Deno is fully built — it stays in `psychicRuntimes`
// above and in all the pm-keyed machinery — but is intentionally not offered yet: Deno's
// SWC `.ts` transpile drops field-decorator `addInitializer` callbacks (TC39 Stage 3
// violation, SWC #9708), silently breaking Dream/Psychic's boot-time decorator metadata
// (associations, @Encrypted columns, virtual attributes). To offer it again once a released
// Deno fixes this, add 'deno' back to this list — see docs/deno-runtime-readiness.md.
export const selectablePsychicRuntimes = ['node', 'bun'] as const satisfies readonly PsychicRuntime[]
// 'bun' and 'deno' are each their own runtime AND package manager. When chosen as
// the runtime they also become the `packageManager` internally, so the existing
// pm-keyed machinery (lockfile, install, run/tsc commands, app config) extends to
// them with added switch cases. The package-manager PROMPT (psychicPackageManagers)
// stays Node-only — for deno/bun the runtime choice subsumes it.
export type PsychicPackageManager = (typeof psychicPackageManagers)[number] | 'bun' | 'deno'

export interface NewPsychicAppCliOptions {
  packageManager: PsychicPackageManager
  primaryKeyType: PrimaryKeyType
  client: (typeof cliClientAppTypes)[number]
  adminClient: (typeof cliClientAppTypes)[number]
  internalClient: (typeof cliClientAppTypes)[number]
  workers: boolean
  websockets: boolean
  claudePsychicSkill: boolean
  codexPsychicSkill: boolean
  // Optional: generate a hardened GitHub Actions CI workflow. Undefined =>
  // prompted in interactive runs, treated as false in the spec suite.
  githubActions?: boolean
  // Optional: which JS runtime the generated app targets (node|deno|bun).
  // Undefined => prompted interactively, defaults to 'node' in the spec suite.
  // For 'deno'/'bun' the runtime also sets packageManager (each is its own
  // toolchain), so the package-manager prompt is skipped.
  runtime?: PsychicRuntime
}

export interface InitPsychicAppCliOptions {
  dreamOnly: boolean
  template: (typeof initTemplates)[number]
  importExtension: (typeof importExtensions)[number]
  packageManager: PsychicPackageManager
  primaryKeyType: PrimaryKeyType
  client: (typeof cliClientAppTypes)[number]
  adminClient: (typeof cliClientAppTypes)[number]
  internalClient: (typeof cliClientAppTypes)[number]
  workers: boolean
  websockets: boolean
  claudePsychicSkill: boolean
  codexPsychicSkill: boolean
  serializersPath: string
  typesPath: string
  modelsPath: string
  servicesPath: string
  controllersPath: string
  confPath: string
  factoriesPath: string
  modelSpecsPath: string
  controllerSpecsPath: string
  dbPath: string
  openapiPath: string
  utilsPath: string
  executablesPath: string
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

const logger = new DreamCliLogger()

export default async function newPsychicApp(appName: string, options: NewPsychicAppCliOptions) {
  if (!testEnv()) {
    logger.log(c.greenBright(`${appName}`), {
      logPrefix: '☼',
      logPrefixColor: 'greenBright',
    })
    logger.log(
      c.greenBright(
        `${appName
          .split('')
          .map(() => '')
          .join('-')}-`,
      ),
      {
        logPrefix: ' ',
        logPrefixColor: 'greenBright',
      },
    )
  }

  await buildNewPsychicAppOptionsWithPrompt(options)

  if (!testEnv()) {
    logger.log(`Installing psychic framework to ./${appName}`)
    logger.logStartProgress(`copying boilerplate...`)
  }
  const rootPath = `./${appName}`
  await copyApiBoilerplate(appName, options)
  if (!testEnv()) logger.logEndProgress()

  if (!testEnv()) logger.logStartProgress(`installing api dependencies...`)
  await installApiDependencies(appName, { options, logger })
  if (!testEnv()) logger.logEndProgress()

  if (options.claudePsychicSkill) {
    if (!testEnv()) logger.logStartProgress(`installing claude psychic-skill...`)
    installPsychicSkill(rootPath, 'claude')
    if (!testEnv()) logger.logEndProgress()
  }

  if (options.codexPsychicSkill) {
    if (!testEnv()) logger.logStartProgress(`installing codex psychic-skill...`)
    installPsychicSkill(rootPath, 'codex')
    if (!testEnv()) logger.logEndProgress()
  }

  if (!testEnv()) {
    // sleeping here because yarn has a delayed print that we need to clean up after install completes
    await sleep(1000)
    await gitInit(appName, logger)
  }

  if (options.client !== 'none') {
    await addClientApp({
      sourceColor: 'magenta',
      logger,
      client: options.client,
      clientRootFolderName: 'client',
      appName,
      options,
      rootPath,
      port: 3000,
    })
  }

  if (options.adminClient !== 'none') {
    await addClientApp({
      sourceColor: 'blue',
      logger,
      client: options.adminClient,
      clientRootFolderName: 'admin',
      appName,
      options,
      rootPath,
      port: 3001,
    })
  }

  if (options.internalClient !== 'none') {
    await addClientApp({
      sourceColor: 'cyan',
      logger,
      client: options.internalClient,
      clientRootFolderName: 'internal',
      appName,
      options,
      rootPath,
      port: 3002,
    })
  }

  if (!testEnv()) {
    await initialGitCommit(appName, logger)

    logger.log(logo(), { logPrefix: '' })
    logger.log(welcomeMessage(apiOnlyOptions(options) ? appName : appName + '/api', options.packageManager), {
      logPrefix: '',
    })
  }
}
