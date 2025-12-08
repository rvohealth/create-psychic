import * as fs from 'node:fs'
import * as path from 'node:path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import { cliClientAppTypes, NewPsychicAppCliOptions, PsychicPackageManager } from './newPsychicApp.js'
import sspawn from './sspawn.js'
import colorize from '../logger/loggable/colorize.js'
import getLockfileName from './getLockfileName.js'
import getApiRoot from './getApiRoot.js'

export default async function addClientApp({
  client,
  clientRootFolderName,
  rootPath,
  appName,
  options,
  logger,
  sourceColor,
  port,
}: {
  client: (typeof cliClientAppTypes)[number]
  clientRootFolderName: string
  rootPath: string
  appName: string
  options: NewPsychicAppCliOptions
  logger: DreamCliLogger
  sourceColor: DreamCliForegroundColor
  port: number
}) {
  if (!testEnv()) {
    logger.logStartProgress(`initializing client app: ${clientRootFolderName}...`)
  }

  const apiRoot = getApiRoot(appName, options)

  const initPackageManager = initilizePackageManagerCmd(options.packageManager)
  const createCmd = viteCmd(options.packageManager, clientRootFolderName, `${client}-ts`)

  switch (client) {
    case 'react':
      await sspawn(`cd ${rootPath} && ${createCmd} && cd ${clientRootFolderName} ${initPackageManager}`, {
        onStdout: message => {
          logger.logContinueProgress(
            colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
            {
              logPrefixColor: sourceColor,
            },
          )
        },
      })

      fs.writeFileSync(
        path.join(apiRoot, '..', clientRootFolderName, 'vite.config.ts'),
        await ViteConfBuilder.build(path.join(apiRoot, '..', clientRootFolderName, 'vite.config.ts'), {
          port,
        }),
      )
      fs.writeFileSync(
        path.join(apiRoot, '..', clientRootFolderName, '.eslintrc.cjs'),
        ESLintConfBuilder.buildForViteReact(),
      )

      break

    case 'vue':
      await sspawn(`cd ${rootPath} && ${createCmd} && cd ${clientRootFolderName} ${initPackageManager}`, {
        onStdout: message => {
          logger.logContinueProgress(
            colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
            {
              logPrefixColor: sourceColor,
            },
          )
        },
      })

      fs.writeFileSync(
        path.join(apiRoot, '..', clientRootFolderName, 'vite.config.ts'),
        await ViteConfBuilder.build(path.join(apiRoot, '..', clientRootFolderName, 'vite.config.ts'), {
          port,
        }),
      )
      break

    case 'nextjs':
      await sspawn(
        `cd ${rootPath} && npx create-next-app@latest ${clientRootFolderName} --eslint --app --ts --skip-install --use-${options.packageManager} --yes --disable-git && cd ${clientRootFolderName} ${initPackageManager}`,
        {
          onStdout: message => {
            logger.logContinueProgress(
              colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
              {
                logPrefixColor: sourceColor,
              },
            )
          },
        },
      )
      break

    case 'nuxt':
      await sspawn(
        `cd ${rootPath} && ${options.packageManager} create nuxt-app ${clientRootFolderName} --packageManager ${options.packageManager} --no-install ${initPackageManager}`,
        {
          onStdout: message => {
            logger.logContinueProgress(
              colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
              {
                logPrefixColor: sourceColor,
              },
            )
          },
        },
      )
      break
  }

  addMissingClientGitignoreStatements(path.join(apiRoot, '..', clientRootFolderName, '.gitignore'))

  // only bother installing packages if not in test env to save time
  await sspawn(
    `cd ${path.join(apiRoot, '..', clientRootFolderName)} && ${installCmd(options.packageManager)}`,
    {
      onStdout: message => {
        logger.logContinueProgress(
          colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
          {
            logPrefixColor: sourceColor,
          },
        )
      },
    },
  )

  logger.logEndProgress()
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

function initilizePackageManagerCmd(packageManager: PsychicPackageManager) {
  const lockfile = getLockfileName(packageManager)
  switch (packageManager) {
    case 'yarn':
      return `&& touch ${lockfile} && corepack enable && yarn set version stable`
    case 'pnpm':
      return ''
    // return `corepack enable pnpm`
    // return `corepack enable pnpm && corepack use pnpm@latest`
    case 'npm':
      return ''
    // return 'corepack enable && corepack enable npm'
    // return `&& touch ${lockfile} && corepack use npm@latest`
  }
}

function installCmd(packageManager: PsychicPackageManager) {
  const lockfile = getLockfileName(packageManager)
  switch (packageManager) {
    case 'yarn':
      return `touch ${lockfile} && yarn install`
    default:
      return `${packageManager} install`
  }
}

function viteCmd(packageManager: PsychicPackageManager, clientRootFolderName: string, template: string) {
  switch (packageManager) {
    case 'yarn':
      return `yarn create vite ${clientRootFolderName} --template ${template}`
    case 'pnpm':
      return `pnpm create vite ${clientRootFolderName} --template ${template}`
    case 'npm':
      return `npm create vite@latest ${clientRootFolderName} -- --template ${template}`
  }
}
