import fs from 'fs'
import path from 'path'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder'
import ViteConfBuilder from '../file-builders/ViteConfBuilder'
import copyRecursive from './copyRecursive'
import { cliClientAppTypes, InitPsychicAppCliOptions } from './newPsychicApp'
import sspawn from './sspawn'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements'

export default async function addClientApp({
  client,
  clientRootFolderName,
  rootPath,
  appName,
  projectPath,
  options,
}: {
  client: (typeof cliClientAppTypes)[number]
  clientRootFolderName: string
  rootPath: string
  appName: string
  projectPath: string
  options: InitPsychicAppCliOptions
}) {
  const yarnSetVersionCmd = 'corepack enable && yarn set version stable'

  switch (client) {
    case 'react':
      await sspawn(
        `cd ${rootPath} && yarn create vite ${clientRootFolderName} --template react-ts && cd ${clientRootFolderName} && touch yarn.lock && ${yarnSetVersionCmd}`
      )

      fs.mkdirSync(path.join(appName, clientRootFolderName, 'src', 'config'))

      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'config', 'routes.ts')
      )

      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, 'vite.config.ts'),
        ViteConfBuilder.build(options)
      )
      fs.writeFileSync(
        path.join(projectPath, '..', clientRootFolderName, '.eslintrc.cjs'),
        ESLintConfBuilder.buildForViteReact()
      )

      break

    case 'vue':
      await sspawn(
        `cd ${rootPath} && ${yarnSetVersionCmd} && yarn create vite ${clientRootFolderName} --template vue-ts`
      )
      fs.mkdirSync(path.join('.', appName, clientRootFolderName, 'src', 'config'))

      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'config', 'routes.ts')
      )

      fs.writeFileSync(
        path.join(projectPath, '..', 'client', 'vite.config.ts'),
        ViteConfBuilder.build(options)
      )
      break

    case 'nuxt':
      await sspawn(`cd ${rootPath} && ${yarnSetVersionCmd} && yarn create nuxt-app ${clientRootFolderName}`)

      fs.mkdirSync(path.join('.', appName, clientRootFolderName, 'config'))

      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
        path.join(projectPath, '..', clientRootFolderName, 'src', 'api')
      )
      copyRecursive(
        path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
        path.join(projectPath, '..', clientRootFolderName, 'config', 'routes.ts')
      )

      break
  }

  addMissingClientGitignoreStatements(path.join(projectPath, '..', clientRootFolderName, '.gitignore'))

  if (!testEnv() || process.env.REALLY_BUILD_CLIENT_DURING_SPECS === '1') {
    // only bother installing packages if not in test env to save time
    await sspawn(
      `cd ${path.join(projectPath, '..', clientRootFolderName)} && touch yarn.lock && yarn install`
    )
  }
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}
