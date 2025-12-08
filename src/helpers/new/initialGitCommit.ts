import * as path from 'node:path'
import sspawn from '../sspawn.js'
import DreamCliLogger from '../../logger/DreamCliLogger.js'
import colorize from '../../logger/loggable/colorize.js'

export default async function initialGitCommit(appName: string, logger: DreamCliLogger) {
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
    },
  )

  logger.logEndProgress()
}
