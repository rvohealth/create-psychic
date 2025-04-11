import c from 'yoctocolors'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import addClientApp from './addClientApp.js'
import buildNewPsychicAppOptionsWithPrompt from './buildNewPsychicAppOptionsWithPrompt.js'
import copyApiBoilerplate from './copyApiBoilerplate.js'
import generateUuidMigration from './generateUuidMigration.js'
import gitInit from './gitInit.js'
import initialGitCommit from './initialGitCommit.js'
import installApiDependencies from './installApiDependencies.js'
import logo from './logo.js'
import sleep from './sleep.js'
import welcomeMessage from './welcomeMessage.js'

export const cliPrimaryKeyTypes = ['bigserial', 'serial', 'uuid'] as const
export const cliClientAppTypes = ['nextjs', 'react', 'vue', 'nuxt', 'none'] as const

export const psychicPackageManagers = ['yarn', 'pnpm', 'npm'] as const
export type PsychicPackageManager = (typeof psychicPackageManagers)[number]

export interface InitPsychicAppCliOptions {
  packageManager: PsychicPackageManager
  primaryKeyType: (typeof cliPrimaryKeyTypes)[number]
  client: (typeof cliClientAppTypes)[number]
  adminClient: (typeof cliClientAppTypes)[number]
  workers: boolean
  websockets: boolean
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

const logger = new DreamCliLogger()

export default async function newPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
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
          .join('-')}-`
      ),
      {
        logPrefix: ' ',
        logPrefixColor: 'greenBright',
      }
    )
  }

  await buildNewPsychicAppOptionsWithPrompt(options)

  if (!testEnv()) {
    logger.log(`Installing psychic framework to ./${appName}`)
    logger.logStartProgress(`copying boilerplate...`)
  }

  const rootPath = `./${appName}`

  await copyApiBoilerplate(appName, options)

  if (!testEnv()) {
    logger.logEndProgress()
    logger.logStartProgress(`installing api dependencies...`)
  }

  await installApiDependencies(appName, { options, logger })

  if (!testEnv()) {
    // sleeping here because yarn has a delayed print that we need to clean up after install completes
    await sleep(1000)
    await gitInit(appName, logger)
  }

  // don't sync yet, since we need to run migrations first
  // await sspawn(`yarn --cwd=${projectPath} dream sync:existing`)

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

  if (options.primaryKeyType === 'uuid') {
    await generateUuidMigration(appName, { logger, options })
  }

  if (!testEnv()) {
    await initialGitCommit(appName, logger)

    logger.log(logo(), { logPrefix: '' })
    const hasClient = options.client !== 'none' || options.adminClient !== 'none'
    logger.log(welcomeMessage(hasClient ? appName + '/api' : appName, options.packageManager), {
      logPrefix: '',
    })
  }
}
