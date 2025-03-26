import * as fs from 'fs'
import * as path from 'path'
import c from 'yoctocolors'
import AppConfigBuilder from '../file-builders/AppConfigBuilder.js'
import DreamConfigBuilder from '../file-builders/DreamConfigBuilder.js'
import EnvBuilder from '../file-builders/EnvBuilder.js'
import FeatureSpecExampleBuilder from '../file-builders/FeatureSpecExampleBuilder.js'
import FeatureSpecGlobalBuilder from '../file-builders/FeatureSpecGlobalBuilder.js'
import InitializePsychicAppBuilder from '../file-builders/InitializePsychicAppBuilder.js'
import PackagejsonBuilder from '../file-builders/PackagejsonBuilder.js'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import colorize from '../logger/loggable/colorize.js'
import addClientApp from './addClientApp.js'
import copyRecursive from './copyRecursive.js'
import getLockfileName from './getLockfileName.js'
import logo from './logo.js'
import Select from './select.js'
import sleep from './sleep.js'
import srcPath from './srcPath.js'
import sspawn from './sspawn.js'
import welcomeMessage from './welcomeMessage.js'
import runCmdForPackageManager from './runCmdForPackageManager.js'
import UuidExtensionMigrationBuilder from '../file-builders/UuidExtensionMigrationBuilder.js'

export const cliPrimaryKeyTypes = ['bigserial', 'serial', 'uuid'] as const
export const cliClientAppTypes = ['nextjs', 'react', 'vue', 'nuxt', 'none'] as const

const psychicPackageManagers = ['yarn', 'pnpm', 'npm'] as const
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

  if (!options.packageManager || !psychicPackageManagers.includes(options.packageManager)) {
    const answer = await new Select(
      'what package manager would you like to use?',
      psychicPackageManagers
    ).run()
    options.packageManager = answer
  }

  if (!options.primaryKeyType || !cliPrimaryKeyTypes.includes(options.primaryKeyType)) {
    const answer = await new Select('what primary key type would you like to use?', cliPrimaryKeyTypes).run()
    options.primaryKeyType = answer
  }

  let monoRepo = false
  if (!options.client && !options.adminClient) {
    const answer = await new Select(
      `Would you like a monorepo?\nFor more info, see https://psychicframework.com/docs/monorepo`,
      ['yes', 'no'] as const
    ).run()
    monoRepo = answer === 'yes'
  }

  if (monoRepo) {
    if (!options.client || !cliClientAppTypes.includes(options.client)) {
      const answer = await new Select(
        'which front end client would you like to use?',
        cliClientAppTypes
      ).run()
      options.client = answer
    }

    if (!options.adminClient || !cliClientAppTypes.includes(options.adminClient)) {
      const answer = await new Select(
        'which front end client would you like to use for your admin app?',
        cliClientAppTypes
      ).run()
      options.adminClient = answer
    }
  } else {
    // if they explicitly provide clients, we do not want to override, so we use ||=
    options.client ||= 'none'
    options.adminClient ||= 'none'
  }

  if (options.workers === undefined) {
    const answer = await new Select('background workers?', ['yes', 'no'] as const).run()
    options.workers = answer === 'yes'
  }

  if (options.websockets === undefined) {
    const answer = await new Select('websockets?', ['no', 'yes'] as const).run()
    options.websockets = answer === 'yes'
  }

  if (!testEnv()) {
    logger.log(`Installing psychic framework to ./${appName}`)
    logger.logStartProgress(`copying boilerplate...`)
  }

  const rootPath = `./${appName}`
  const hasClient = options.client !== 'none' || options.adminClient !== 'none'
  const projectPath = hasClient ? path.join(process.cwd(), appName, 'api') : path.join(process.cwd(), appName)

  if (hasClient) {
    fs.mkdirSync(`./${appName}`)
  }

  copyRecursive(srcPath('..', 'boilerplate', 'api'), projectPath)

  // yarnrc.yml included as non-dot-file so that it becomes part of the package
  // move it to .yarnrc.yml if using yarn; otherwise, delete it
  if (options.packageManager === 'yarn') {
    fs.renameSync(`${projectPath}/yarnrc.yml`, `${projectPath}/.yarnrc.yml`)
  } else {
    fs.rmSync(path.join(projectPath, 'yarnrc.yml'))
  }

  fs.renameSync(`${projectPath}/gitignore`, `${projectPath}/.gitignore`)

  fs.writeFileSync(path.join(projectPath, '.env'), EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(path.join(projectPath, '.env.test'), EnvBuilder.build({ appName, env: 'test' }))
  fs.writeFileSync(path.join(projectPath, 'package.json'), await PackagejsonBuilder.buildAPI(options))

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'app.ts'),
    await AppConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'dream.ts'),
    await DreamConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'initializePsychicApplication.ts'),
    await InitializePsychicAppBuilder.build(options)
  )

  fs.writeFileSync(
    path.join(projectPath, 'spec', 'features', 'setup', 'globalSetup.ts'),
    await FeatureSpecGlobalBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(projectPath, 'spec', 'features', 'example-feature-spec.spec.ts'),
    await FeatureSpecExampleBuilder.build(options)
  )

  if (!options.workers) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'workers.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'models', 'ApplicationBackgroundedModel.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'services', 'ApplicationBackgroundedService.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'services', 'ApplicationScheduledService.ts'))
  }

  if (!options.websockets) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'websockets.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'helpers', 'ws.ts'))
  }

  if (!testEnv()) {
    logger.logEndProgress()
    logger.logStartProgress(`installing api dependencies...`)
  }

  const lockfileName = getLockfileName(options.packageManager)

  switch (options.packageManager) {
    case 'yarn':
      await sspawn(
        `cd ${projectPath} && touch ${lockfileName} && corepack enable yarn && yarn set version stable && yarn install && yarn add @rvoh/dream @rvoh/psychic`,
        {
          onStdout: message => {
            logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
              logPrefixColor: 'cyan',
            })
          },
        }
      )
      logger.logEndProgress()
      break

    case 'pnpm':
      await sspawn(
        `cd ${projectPath} && corepack enable pnpm && pnpm install && pnpm add @rvoh/dream @rvoh/psychic`,
        {
          onStdout: message => {
            logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
              logPrefixColor: 'cyan',
            })
          },
        }
      )
      logger.logEndProgress()
      break

    case 'npm':
      await sspawn(
        `cd ${projectPath} && touch ${lockfileName} && npm install && npm install @rvoh/dream @rvoh/psychic`,
        {
          onStdout: message => {
            logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
              logPrefixColor: 'cyan',
            })
          },
        }
      )
      logger.logEndProgress()
      break
  }

  // sleeping here because yarn has a delayed print that we need to clean up
  if (!testEnv()) await sleep(1000)

  if (!testEnv()) {
    logger.logStartProgress(`initializing git repository...`)

    // only do this if not test, since using git in CI will fail
    await sspawn(`cd ${path.join(process.cwd(), appName)} && git init`, {
      onStdout: message => {
        logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
          logPrefixColor: 'cyan',
        })
      },
    })

    logger.logEndProgress()
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
      projectPath,
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
      projectPath,
      options,
      rootPath,
      port: 3001,
    })
  }

  if (options.primaryKeyType === 'uuid') {
    logger.logStartProgress('generating initial uuid migration...')
    const runCmd = runCmdForPackageManager(options.packageManager)

    // do not use git during tests, since this will break in CI
    await sspawn(`cd ${projectPath} && ${runCmd} psy g:migration add-uuid-extension`, {
      onStdout: message => {
        logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
          logPrefixColor: 'cyan',
        })
      },
    })

    const migrations = fs.readdirSync(path.join(projectPath, 'src', 'db', 'migrations'))
    const migration = migrations.find(filePath => /add-uuid-extension\.ts$/.test(filePath))!

    if (!migration) {
      throw new Error(
        `Failed to generate initial uuid migration. Migration not found matching: "add-uuid-extension.ts"`
      )
    }

    fs.writeFileSync(
      path.join(projectPath, 'src', 'db', 'migrations', migration),
      UuidExtensionMigrationBuilder.build()
    )

    logger.logEndProgress()
  }

  if (!testEnv()) {
    logger.logStartProgress('writing initial commit...')

    // do not use git during tests, since this will break in CI
    await sspawn(
      `cd ${path.join(process.cwd(), appName)} && git add --all && git commit -m 'psychic init' --quiet`,
      {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      }
    )

    logger.logEndProgress()

    logger.log(logo(), { logPrefix: '' })
    logger.log(welcomeMessage(hasClient ? appName + '/api' : appName), {
      logPrefix: '',
    })
  }
}
