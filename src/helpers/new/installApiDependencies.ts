import DreamCliLogger from '../../logger/DreamCliLogger.js'
import colorize from '../../logger/loggable/colorize.js'
import getApiRoot from '../getApiRoot.js'
import getLockfileName from '../getLockfileName.js'
import { NewPsychicAppCliOptions } from '../newPsychicApp.js'
import execCmdForPackageManager from '../packageManager/execCmdForPackageManager.js'
import sspawn from '../sspawn.js'

export default async function installApiDependencies(
  appName: string,
  { options, logger }: { options: NewPsychicAppCliOptions; logger: DreamCliLogger },
) {
  const lockfileName = getLockfileName(options.packageManager)
  const apiRoot = getApiRoot(appName, options)

  switch (options.packageManager) {
    case 'yarn':
      await sspawn(
        `cd ${apiRoot} && touch ${lockfileName} && corepack enable yarn && yarn set version stable && yarn install && yarn up "@rvoh/*"`,
        {
          onStdout: message => {
            logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
              logPrefixColor: 'cyan',
            })
          },
        },
      )
      break

    case 'pnpm':
      await sspawn(`cd ${apiRoot} && corepack enable pnpm && pnpm install && pnpm up "@rvoh/*"`, {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      })
      break

    case 'npm':
      await sspawn(
        `cd ${apiRoot} && touch ${lockfileName} && npm install && npm update @rvoh/dream @rvoh/psychic @rvoh/psychic-workers @rvoh/psychic-websockets`,
        {
          onStdout: message => {
            logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
              logPrefixColor: 'cyan',
            })
          },
        },
      )
      break

    case 'bun':
      // bun is its own installer; `bun install` writes bun.lock and resolves the
      // ^-ranged @rvoh deps to their latest in-range publish (no separate update).
      await sspawn(`cd ${apiRoot} && bun install`, {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      })
      break

    case 'deno':
      // `deno install` reads package.json, writes deno.lock + a node_modules dir,
      // and blocks dependency build scripts by default (the supply-chain posture).
      await sspawn(`cd ${apiRoot} && deno install`, {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      })
      break
  }
  logger.logEndProgress()

  const cmd = execCmdForPackageManager(options.packageManager, 'puppeteer', 'browsers install firefox')
  logger.logStartProgress(`installing firefox using: "${cmd}"...`)
  await sspawn(`cd ${apiRoot} && ${cmd}`, {
    onStdout: message => {
      logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
        logPrefixColor: 'cyan',
      })
    },
  })
  logger.logEndProgress()
}
