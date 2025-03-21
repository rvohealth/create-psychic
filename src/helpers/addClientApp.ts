import * as fs from 'fs'
import * as path from 'path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import DreamCliLoggableSpinner from '../logger/loggable/DreamCliLoggableSpinner.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import copyRecursive from './copyRecursive.js'
import { cliClientAppTypes, InitPsychicAppCliOptions, PsychicPackageManager } from './newPsychicApp.js'
import srcPath from './srcPath.js'
import sspawn from './sspawn.js'
import colorize from '../logger/loggable/colorize.js'
import getLockfileName from './getLockfileName.js'

export default async function addClientApp({
  client,
  clientRootFolderName,
  rootPath,
  appName,
  projectPath,
  options,
  logger,
  sourceColor,
}: {
  client: (typeof cliClientAppTypes)[number]
  clientRootFolderName: string
  rootPath: string
  appName: string
  projectPath: string
  options: InitPsychicAppCliOptions
  logger: DreamCliLogger
  sourceColor: DreamCliForegroundColor
}) {
  logger.purge()
  let spinner: DreamCliLoggableSpinner | undefined = undefined

  if (!testEnv()) {
    spinner = logger.log(`initializing client app: ${clientRootFolderName}...`, { spinner: true })
  }

  const initPackageManager = initilizePackageManagerCmd(options.packageManager)
  const createCmd = viteCmd(options.packageManager, clientRootFolderName, `${client}-ts`)

  switch (client) {
    case 'react':
      await sspawn(`cd ${rootPath} && ${createCmd} && cd ${clientRootFolderName} ${initPackageManager}`, {
        onStdout: message => {
          logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
            permanent: true,
            logPrefix: '├',
            logPrefixColor: sourceColor,
          })
        },
      })

      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'),
        await ViteConfBuilder.build(path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'))
      )
      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, '.eslintrc.cjs'),
        ESLintConfBuilder.buildForViteReact()
      )

      break

    case 'vue':
      await sspawn(`cd ${rootPath} && ${createCmd} && cd ${clientRootFolderName} ${initPackageManager}`, {
        onStdout: message => {
          logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
            permanent: true,
            logPrefix: '├',
            logPrefixColor: sourceColor,
          })
        },
      })

      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'),
        await ViteConfBuilder.build(path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'))
      )
      break

    case 'nextjs':
      await sspawn(
        `cd ${rootPath} && npx create-next-app@latest ${clientRootFolderName} --eslint --app --ts --skip-install --use-${options.packageManager} --yes && cd ${clientRootFolderName} ${initPackageManager}`,
        {
          onStdout: message => {
            logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
              permanent: true,
              logPrefix: '├',
              logPrefixColor: sourceColor,
            })
          },
        }
      )
      break

    case 'nuxt':
      await sspawn(
        `cd ${rootPath} && ${options.packageManager} create nuxt-app ${clientRootFolderName} --packageManager ${options.packageManager} --no-install ${initPackageManager}`,
        {
          onStdout: message => {
            logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
              permanent: true,
              logPrefix: '├',
              logPrefixColor: sourceColor,
            })
          },
        }
      )
      break
  }

  addMissingClientGitignoreStatements(path.join(projectPath, '..', clientRootFolderName, '.gitignore'))

  logger.purge()

  // only bother installing packages if not in test env to save time
  await sspawn(
    `cd ${path.join(projectPath, '..', clientRootFolderName)} && ${installCmd(options.packageManager)}`,
    {
      onStdout: message => {
        logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
          permanent: true,
          logPrefix: '├',
          logPrefixColor: sourceColor,
        })
      },
    }
  )

  spinner?.stop()
  logger.purge()
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

type ViteTemplate = 'react-ts' | 'vue-ts' | ''
