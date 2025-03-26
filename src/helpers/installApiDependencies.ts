import DreamCliLogger from '../logger/DreamCliLogger.js'
import colorize from '../logger/loggable/colorize.js'
import getApiRoot from './getApiRoot.js'
import getLockfileName from './getLockfileName.js'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'
import sspawn from './sspawn.js'

export default async function installApiDependencies(
  appName: string,
  { options, logger }: { options: InitPsychicAppCliOptions; logger: DreamCliLogger }
) {
  const lockfileName = getLockfileName(options.packageManager)
  const apiRoot = getApiRoot(appName, options)

  switch (options.packageManager) {
    case 'yarn':
      await sspawn(
        `cd ${apiRoot} && touch ${lockfileName} && corepack enable yarn && yarn set version stable && yarn install && yarn add @rvoh/dream @rvoh/psychic`,
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
        `cd ${apiRoot} && corepack enable pnpm && pnpm install && pnpm add @rvoh/dream @rvoh/psychic`,
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
        `cd ${apiRoot} && touch ${lockfileName} && npm install && npm install @rvoh/dream @rvoh/psychic`,
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
}
