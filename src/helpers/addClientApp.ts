import * as fs from 'fs'
import * as path from 'path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder.js'
import ViteConfBuilder from '../file-builders/ViteConfBuilder.js'
import DreamCliLogger, { DreamCliForegroundColor } from '../logger/DreamCliLogger.js'
import DreamCliLoggableSpinner from '../logger/loggable/DreamCliLoggableSpinner.js'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements.js'
import copyRecursive from './copyRecursive.js'
import { cliClientAppTypes, InitPsychicAppCliOptions } from './newPsychicApp.js'
import srcPath from './srcPath.js'
import sspawn from './sspawn.js'
import colorize from '../logger/loggable/colorize.js'

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

  const yarnSetVersionCmd = 'corepack enable && yarn set version stable'

  switch (client) {
    case 'react':
      await sspawn(
        `cd ${rootPath} && yarn create vite ${clientRootFolderName} --template react-ts && cd ${clientRootFolderName} && touch yarn.lock && ${yarnSetVersionCmd}`,
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
      fs.mkdirSync(path.join(appName, clientRootFolderName, 'src', 'config'))

      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'config', 'routes.ts')
      )

      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'),
        ViteConfBuilder.build(client)
      )
      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, '.eslintrc.cjs'),
        ESLintConfBuilder.buildForViteReact()
      )

      break

    case 'vue':
      await sspawn(
        `cd ${rootPath} && ${yarnSetVersionCmd} && yarn create vite ${clientRootFolderName} --template vue-ts`,
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

      fs.mkdirSync(path.join(process.cwd(), appName, clientRootFolderName, 'src', 'config'))

      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'config', 'routes.ts')
      )

      fs.writeFileSync(
        path.join(projectPath, '..', 'client', 'vite.config.ts'),
        ViteConfBuilder.build(client)
      )
      break

    case 'nuxt':
      await sspawn(`cd ${rootPath} && ${yarnSetVersionCmd} && yarn create nuxt-app ${clientRootFolderName}`, {
        onStdout: message => {
          logger.log(colorize(`[${clientRootFolderName}]`, { color: sourceColor }) + ' ' + message, {
            permanent: true,
            logPrefix: '├',
            logPrefixColor: sourceColor,
          })
        },
      })

      fs.mkdirSync(path.join(process.cwd(), appName, clientRootFolderName, 'config'))

      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        srcPath('..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'config', 'routes.ts')
      )

      break
  }

  addMissingClientGitignoreStatements(path.join(projectPath, '..', clientRootFolderName, '.gitignore'))

  if (!testEnv() || process.env.REALLY_BUILD_CLIENT_DURING_SPECS === '1') {
    logger.purge()

    // only bother installing packages if not in test env to save time
    await sspawn(
      `cd ${path.join(projectPath, '..', clientRootFolderName)} && touch yarn.lock && yarn install`,
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
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}
