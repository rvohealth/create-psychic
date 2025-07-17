import c from 'yoctocolors'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import generateUuidMigration from './generateUuidMigration.js'
import addMissingScriptsToPackageJson from './init/addMissingScriptsToPackageJson.js'
import addMissingTsconfigRules from './init/addMissingTsconfigRules.js'
import buildInitPsychicAppOptionsWithPrompt from './init/buildInitPsychicAppOptionsWithPrompt.js'
import copyInitApiBoilerplate from './init/copyInitApiBoilerplate.js'
import initMessage from './init/initMessage.js'
import installInitApiDependencies from './init/installInitApiDependencies.js'
import logo from './logo.js'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'

export const cliPrimaryKeyTypes = ['bigserial', 'serial', 'uuid'] as const
export const cliClientAppTypes = ['nextjs', 'react', 'vue', 'nuxt', 'none'] as const

export const psychicPackageManagers = ['yarn', 'pnpm', 'npm'] as const
export type PsychicPackageManager = (typeof psychicPackageManagers)[number]

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

const logger = new DreamCliLogger()

export default async function initPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
  if (!testEnv()) {
    const title = `init: ${appName}`
    logger.log(c.greenBright(title), {
      logPrefix: '☼',
      logPrefixColor: 'greenBright',
    })
    logger.log(
      c.greenBright(
        `${title
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

  await buildInitPsychicAppOptionsWithPrompt(options)

  if (!testEnv()) {
    logger.log(`Installing psychic framework to the current directory`)
    logger.logStartProgress(`copying boilerplate...`)
  }

  await copyInitApiBoilerplate(appName, options)
  await installInitApiDependencies(options)

  if (!testEnv()) {
    logger.logEndProgress()
    logger.logStartProgress(`installing api dependencies...`)
  }

  await addMissingScriptsToPackageJson(options)
  await addMissingTsconfigRules()

  if (options.primaryKeyType === 'uuid') {
    await generateUuidMigration(appName, { logger, options })
  }

  if (!testEnv()) {
    logger.log(logo(), { logPrefix: '' })
    logger.log(initMessage(options), { logPrefix: '' })
  }
}
