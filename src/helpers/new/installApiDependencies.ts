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
      // yarn resolves the ^-ranged @rvoh deps to highest-in-range on a clean
      // install (no lockfile is shipped to pin them), so no explicit `yarn up`
      // is needed — see the pnpm case for why only pnpm keeps a defensive one.
      await sspawn(
        `cd ${apiRoot} && touch ${lockfileName} && corepack enable yarn && yarn set version stable && yarn install`,
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
      // `pnpm install` already resolves the ^-ranged @rvoh deps to their latest
      // in-range publish: the boilerplate ships no lockfile to pin them and
      // pnpm's default resolution-mode is `highest`. The trailing
      // `pnpm up "@rvoh/*"` is insurance for the one manager that can resolve to
      // the floor instead — if a user's .npmrc (or a future pnpm default) sets
      // `resolution-mode=lowest-direct`, install would pin e.g. dream@2.13.0 and
      // this re-floats every @rvoh package to latest-in-range, so a freshly
      // scaffolded app always starts on the newest published Dream/Psychic.
      await sspawn(`cd ${apiRoot} && corepack enable pnpm && pnpm install && pnpm up "@rvoh/*"`, {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      })
      break

    case 'npm':
      // npm resolves the ^-ranged @rvoh deps to highest-in-range on a clean
      // install (no lockfile is shipped to pin them), so no explicit
      // `npm update` is needed — see the pnpm case for why only pnpm keeps a
      // defensive one.
      await sspawn(`cd ${apiRoot} && touch ${lockfileName} && npm install`, {
        onStdout: message => {
          logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
            logPrefixColor: 'cyan',
          })
        },
      })
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
