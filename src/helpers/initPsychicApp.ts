import c from 'yoctocolors'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import addMissingScriptsToPackageJson from './init/addMissingScriptsToPackageJson.js'
import addMissingTsconfigRules from './init/addMissingTsconfigRules.js'
import buildInitPsychicAppOptionsWithPrompt from './init/buildInitPsychicAppOptionsWithPrompt.js'
import copyInitApiBoilerplate from './init/copyInitApiBoilerplate.js'
import initMessage from './init/initMessage.js'
import installInitApiDependencies from './init/installInitApiDependencies.js'
import installPsychicSkill from './installPsychicSkill.js'
import logo from './logo.js'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'

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
          .join('-')}-`,
      ),
      {
        logPrefix: ' ',
        logPrefixColor: 'greenBright',
      },
    )
  }

  await buildInitPsychicAppOptionsWithPrompt(options)

  if (!testEnv()) {
    logger.log(`Installing psychic framework to the current directory`)
    logger.logStartProgress(`copying boilerplate...`)
  }
  await copyInitApiBoilerplate(appName, options)
  await installInitApiDependencies(options)
  if (!testEnv()) logger.logEndProgress()

  if (!testEnv()) logger.logStartProgress(`installing api dependencies...`)
  await addMissingScriptsToPackageJson(options)
  await addMissingTsconfigRules()
  if (!testEnv()) logger.logEndProgress()

  if (options.claudePsychicSkill) {
    if (!testEnv()) logger.logStartProgress(`installing claude psychic-skill...`)
    installPsychicSkill('.', 'claude')
    if (!testEnv()) logger.logEndProgress()
  }

  if (options.codexPsychicSkill) {
    if (!testEnv()) logger.logStartProgress(`installing codex psychic-skill...`)
    installPsychicSkill('.', 'codex')
    if (!testEnv()) logger.logEndProgress()
  }

  if (!testEnv()) {
    logger.log(logo(), { logPrefix: '' })
    logger.log(initMessage(options), { logPrefix: '' })
  }
}
