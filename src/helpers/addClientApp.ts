import * as fs from 'node:fs'
import * as path from 'node:path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import NextConfigBuilder from '../file-builders/NextConfigBuilder.js'
import NuxtConfigBuilder from '../file-builders/NuxtConfigBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import { cliClientAppTypes, NewPsychicAppCliOptions, PsychicPackageManager } from './newPsychicApp.js'
import sspawn from './sspawn.js'
import colorize from '../logger/loggable/colorize.js'
import getLockfileName from './getLockfileName.js'
import getApiRoot from './getApiRoot.js'
import ClientDockerDevBuilder from '../file-builders/docker/ClientDockerfileDevBuilder.js'

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

    case 'nextjs': {
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

      const nextConfigPath = path.join(apiRoot, '..', clientRootFolderName, 'next.config.ts')
      fs.writeFileSync(nextConfigPath, await NextConfigBuilder.build(nextConfigPath))

      addFspecBuildDirToGitignore(path.join(apiRoot, '..', clientRootFolderName, '.gitignore'), '.next-fspec')
      break
    }

    case 'nuxt': {
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

      const nuxtConfigPath = path.join(apiRoot, '..', clientRootFolderName, 'nuxt.config.ts')
      if (fs.existsSync(nuxtConfigPath)) {
        fs.writeFileSync(nuxtConfigPath, await NuxtConfigBuilder.build(nuxtConfigPath))
      }

      addFspecBuildDirToGitignore(path.join(apiRoot, '..', clientRootFolderName, '.gitignore'), '.nuxt-fspec')
      break
    }
  }

  addMissingClientGitignoreStatements(path.join(apiRoot, '..', clientRootFolderName, '.gitignore'))

  fs.writeFileSync(
    path.join(apiRoot, '..', clientRootFolderName, 'Dockerfile.dev'),
    await ClientDockerDevBuilder.build(options),
  )

  // use node-modules linker for yarn client apps to ensure compatibility
  // with vite's rolldown bundler, which doesn't support yarn PnP
  if (options.packageManager === 'yarn') {
    fs.writeFileSync(
      path.join(apiRoot, '..', clientRootFolderName, '.yarnrc.yml'),
      'nodeLinker: node-modules\n',
    )
  }

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

function addFspecBuildDirToGitignore(gitignorePath: string, dirName: string) {
  if (fs.existsSync(gitignorePath)) {
    const contents = fs.readFileSync(gitignorePath).toString()
    if (!contents.includes(dirName)) {
      fs.writeFileSync(gitignorePath, `${contents}\n\n# fspec build directory\n${dirName}\n`)
    }
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
