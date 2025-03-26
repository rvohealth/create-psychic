import * as path from 'node:path'
import sspawn from './sspawn.js'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import colorize from '../logger/loggable/colorize.js'

export default async function gitInit(appName: string, logger: DreamCliLogger) {
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
