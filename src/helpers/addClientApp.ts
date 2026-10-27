import * as fs from 'node:fs'
import * as path from 'node:path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import NextConfigBuilder from '../file-builders/NextConfigBuilder.js'
import NuxtConfigBuilder from '../file-builders/NuxtConfigBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import dlxCmdForPackageManager from './packageManager/dlxCmdForPackageManager.js'
import enableCmdForPackageManager from './packageManager/enableCmdForPackageManager.js'
import frontEndPackageManager from './frontEndPackageManager.js'
import { cliClientAppTypes, NewPsychicAppCliOptions, PsychicPackageManager } from './newPsychicApp.js'
import sspawn from './sspawn.js'
import colorize from '../logger/loggable/colorize.js'
import getLockfileName from './getLockfileName.js'
import getApiRoot from './getApiRoot.js'
import ClientDockerDevBuilder from '../file-builders/docker/ClientDockerfileDevBuilder.js'
import ensureNextCompatibleTypescript from './ensureNextCompatibleTypescript.js'
import widenNextPinsForCooldown from './widenNextPinsForCooldown.js'

const CREATE_VITE_VERSION = '9.0.7'

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
      const packageJsonPath = path.join(apiRoot, '..', clientRootFolderName, 'package.json')
      ensureNextCompatibleTypescript(packageJsonPath)
      // yarn and pnpm clients both get a 3-day cooldown (clientYarnrcYml,
      // clientPnpmWorkspaceYaml), and create-next-app exact-pins the
      // just-published `next`, which has no mature fallback.
      if (fePm === 'yarn' || fePm === 'pnpm') widenNextPinsForCooldown(packageJsonPath)
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
        `cd ${rootPath} && ${dlxCmdForPackageManager(fePm, 'nuxi@latest')} init ${clientRootFolderName} --template minimal --no-install --packageManager ${fePm} --no-gitInit -M "" && cd ${clientRootFolderName} ${initPackageManager}`,
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
    fs.writeFileSync(path.join(apiRoot, '..', clientRootFolderName, '.yarnrc.yml'), clientYarnrcYml())
  }

  // Prevent pnpm from traversing up and merging with a parent workspace (e.g. create-psychic's own pnpm-workspace.yaml during specs).
  // Keep dependency build scripts blocked by default without failing when optional native packages request them.
  if (fePm === 'pnpm') {
    fs.writeFileSync(
      path.join(apiRoot, '..', clientRootFolderName, 'pnpm-workspace.yaml'),
      clientPnpmWorkspaceYaml(),
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

// A pnpm client is its own pnpm project (own package.json + lockfile), so it
// does not inherit the api's pnpm-workspace.yaml settings; it needs its own
// copy of the supply-chain cooldown. pnpm 11+ reads minimumReleaseAge only from
// pnpm-workspace.yaml (release-age keys in .npmrc are ignored). The settings-only
// file (no `packages:` key) also keeps pnpm from treating a parent directory's
// pnpm-workspace.yaml as this project's workspace root. Clients depend on no
// @rvoh/* packages, so no cooldown exclude is needed here.
function clientPnpmWorkspaceYaml() {
  return (
    'strictDepBuilds: false\n' +
    '\n' +
    "# SECURITY — don't install dependency versions published in the last 3 days\n" +
    '# (4320 min), matching the api. See SECURITY.md in the api.\n' +
    'minimumReleaseAge: 4320\n'
  )
}

// A yarn client is likewise its own yarn project, so it does not read the api's
// .yarnrc.yml. Without its own gate it gets Yarn's built-in default (1440 min,
// one day, in Yarn 4.10+), so set the api's 3-day gate here too.
function clientYarnrcYml() {
  return (
    'nodeLinker: node-modules\n' +
    '\n' +
    "# SECURITY — don't install dependency versions published in the last 3 days\n" +
    '# (4320 min), matching the api. See SECURITY.md in the api.\n' +
    'npmMinimalAgeGate: 4320\n' +
    '\n' +
    'npmPreapprovedPackages:\n' +
    '  - "@rvoh/*"\n'
  )
}

function initilizePackageManagerCmd(packageManager: PsychicPackageManager) {
  const lockfile = getLockfileName(packageManager)
  switch (packageManager) {
    case 'yarn':
      return `&& touch ${lockfile} && ${enableCmdForPackageManager('yarn')} && yarn set version stable`
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
      return `npx create-vite@${CREATE_VITE_VERSION} ${clientRootFolderName} --template ${template}`
    case 'pnpm':
      return `pnpm create vite@${CREATE_VITE_VERSION} ${clientRootFolderName} --template ${template}`
    case 'npm':
      return `npm create vite@${CREATE_VITE_VERSION} ${clientRootFolderName} -- --template ${template}`
    case 'bun':
      return `bun create vite@${CREATE_VITE_VERSION} ${clientRootFolderName} --template ${template}`
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
