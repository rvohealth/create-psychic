import * as fs from 'node:fs'
import * as path from 'node:path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import NextConfigBuilder from '../file-builders/NextConfigBuilder.js'
import NuxtConfigBuilder from '../file-builders/NuxtConfigBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import frontEndPackageManager from './frontEndPackageManager.js'
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

  // Clients are a Node-ecosystem concern, separate from the API runtime: a Deno
  // API drives its clients with pnpm (Deno adds nothing on the front end). Bun
  // drives its own; Node uses the chosen pm. So everything below keys off `fePm`,
  // never `options.packageManager`.
  const fePm = frontEndPackageManager(options)

  const initPackageManager = initilizePackageManagerCmd(fePm)
  const createCmd = viteCmd(fePm, clientRootFolderName, `${client}-ts`)

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
        `cd ${rootPath} && ${nextAppCmd(fePm, clientRootFolderName)} && cd ${clientRootFolderName} ${initPackageManager}`,
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
      // `nuxi init` directly (not the `create nuxt-app` wrapper), fully
      // non-interactive: `--template minimal` skips the template picker and
      // `-M ""` (empty modules) skips the "browse and install modules?" prompt
      // that otherwise hangs CI. `--no-install` defers install to the shared step.
      await sspawn(
        `cd ${rootPath} && ${fePm === 'bun' ? 'bunx' : 'npx'} nuxi@latest init ${clientRootFolderName} --template minimal --no-install --packageManager ${fePm} --no-gitInit -M "" && cd ${clientRootFolderName} ${initPackageManager}`,
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
  if (fePm === 'yarn') {
    fs.writeFileSync(
      path.join(apiRoot, '..', clientRootFolderName, '.yarnrc.yml'),
      'nodeLinker: node-modules\n\nnpmPreapprovedPackages:\n  - "@rvoh/*"\n',
    )
  }

  // Prevent pnpm from traversing up and merging with a parent workspace (e.g. create-psychic's own pnpm-workspace.yaml during specs).
  // Keep dependency build scripts blocked by default without failing when optional native packages request them.
  if (fePm === 'pnpm') {
    fs.writeFileSync(
      path.join(apiRoot, '..', clientRootFolderName, 'pnpm-workspace.yaml'),
      'strictDepBuilds: false\n',
    )
  }

  // only bother installing packages if not in test env to save time
  await sspawn(`cd ${path.join(apiRoot, '..', clientRootFolderName)} && ${installCmd(fePm)}`, {
    onStdout: message => {
      logger.logContinueProgress(
        colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message,
        {
          logPrefixColor: sourceColor,
        },
      )
    },
  })

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
    case 'npm':
    case 'bun':
      return ''
    default:
      // deno never drives the front end (frontEndPackageManager maps deno → pnpm)
      throw new Error(`front-end package manager cannot be: ${packageManager as string}`)
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
    case 'bun':
      return `bun create vite@latest ${clientRootFolderName} --template ${template}`
    default:
      // deno never drives the front end (frontEndPackageManager maps deno → pnpm)
      throw new Error(`front-end package manager cannot be: ${packageManager as string}`)
  }
}

function nextAppCmd(packageManager: PsychicPackageManager, clientRootFolderName: string) {
  const args = `${clientRootFolderName} --eslint --app --ts --skip-install --use-${packageManager} --yes --disable-git`
  switch (packageManager) {
    case 'yarn':
      return `yarn create next-app ${args}`
    case 'pnpm':
      return `pnpm create next-app ${args}`
    // npm/bun scaffold via the create-next-app package directly (npm keeps `npx` so
    // the flags above forward without an extra `--` separator, as `npm create` needs).
    case 'npm':
      return `npx create-next-app@latest ${args}`
    case 'bun':
      return `bunx create-next-app@latest ${args}`
    default:
      // deno never drives the front end (frontEndPackageManager maps deno → pnpm)
      throw new Error(`front-end package manager cannot be: ${packageManager as string}`)
  }
}
