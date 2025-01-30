import * as c from 'colorette'
import * as fs from 'fs'

import path from 'path'
import AppConfigBuilder from '../file-builders/AppConfigBuilder'
import DreamConfigBuilder from '../file-builders/DreamConfigBuilder'
import EnvBuilder from '../file-builders/EnvBuilder'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder'
import PackagejsonBuilder from '../file-builders/PackagejsonBuilder'
import ViteConfBuilder from '../file-builders/ViteConfBuilder'
import copyRecursive from './copyRecursive'
import gatherUserInput from './gatherUserInput'
import log from './log'
import logo from './logo'
import sleep from './sleep'
import sspawn from './sspawn'
import welcomeMessage from './welcomeMessage'
import InitializePsychicAppBuilder from '../file-builders/InitializePsychicAppBuilder'

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

export default async function newPsychicApp(appName: string, args: string[]) {
  const userOptions = await gatherUserInput(args)

  if (!testEnv()) {
    log.clear()
    log.write(logo() + '\n\n', { cache: true })
    log.write(c.green(`Installing psychic framework to ./${appName}`), { cache: true })
    log.write(c.green(`Step 1. writing boilerplate to ${appName}...`))
  }

  let projectPath: string
  const rootPath = `./${appName}`

  if (userOptions.apiOnly) {
    projectPath = path.join('.', appName)
    copyRecursive(path.join(__dirname, '..', '..', 'boilerplate', 'api'), path.join('.', appName))
  } else {
    projectPath = path.join('.', appName, 'api')
    fs.mkdirSync(`./${appName}`)
    copyRecursive(path.join(__dirname, '..', '..', 'boilerplate', 'api'), projectPath)
  }

  fs.renameSync(`${projectPath}/yarnrc.yml`, `${projectPath}/.yarnrc.yml`)
  fs.renameSync(`${projectPath}/gitignore`, `${projectPath}/.gitignore`)

  if (!testEnv()) {
    log.restoreCache()
    log.write(c.green(`Step 1. write boilerplate to ${appName}: Done!`), { cache: true })
    log.write(c.green(`Step 2. building default config files...`))
  }

  fs.writeFileSync(path.join(projectPath, '.env'), EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(path.join(projectPath, '.env.test'), EnvBuilder.build({ appName, env: 'test' }))
  fs.writeFileSync(path.join(projectPath, 'package.json'), await PackagejsonBuilder.buildAPI(userOptions))

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'app.ts'),
    await AppConfigBuilder.build({ appName, userOptions })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'dream.ts'),
    await DreamConfigBuilder.build({ appName, userOptions })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'cli', 'helpers', 'initializePsychicApplication.ts'),
    await InitializePsychicAppBuilder.build(userOptions)
  )

  if (!userOptions.backgroundWorkers) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'workers.ts'))
  }

  if (!userOptions.ws) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'websockets.ts'))
  }

  if (!testEnv()) {
    log.restoreCache()
    log.write(c.green(`Step 2. build default config files: Done!`), { cache: true })
    log.write(c.green(`Step 3. Installing psychic dependencies...`))

    // only run yarn install if not in test env to save time
    await sspawn(
      `cd ${projectPath} && touch yarn.lock && corepack enable && yarn set version stable && yarn install && yarn add @rvohealth/dream @rvohealth/psychic`
    )
  }

  // sleeping here because yarn has a delayed print that we need to clean up
  if (!testEnv()) await sleep(1000)

  if (!testEnv()) {
    log.restoreCache()
    log.write(c.green(`Step 3. Install psychic dependencies: Done!`), { cache: true })
    log.write(c.green(`Step 4. Initializing git repository...`))

    // only do this if not test, since using git in CI will fail
    await sspawn(`cd ${path.join('.', appName)} && git init`)
  }

  if (!testEnv()) {
    log.restoreCache()
    log.write(c.green(`Step 4. Initialize git repository: Done!`), { cache: true })
    log.write(c.green(`Step 5. Building project...`))
  }

  // don't sync yet, since we need to run migrations first
  // await sspawn(`yarn --cwd=${projectPath} dream sync:existing`)

  const errors: string[] = []

  if (!testEnv() || process.env.REALLY_BUILD_CLIENT_DURING_SPECS === '1')
    if (!userOptions.apiOnly) {
      const yarnVersion = 'corepack enable && yarn set version stable'
      switch (userOptions.client) {
        case 'react':
          await sspawn(
            `cd ${rootPath} && ${yarnVersion} && yarn create vite client --template react-ts && cd client && touch yarn.lock`
          )

          fs.mkdirSync(path.join(appName, 'client', 'src', 'config'))

          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
            path.join(projectPath, '..', 'client', 'src', 'api')
          )
          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
            path.join(projectPath, '..', 'client', 'src', 'config', 'routes.ts')
          )

          fs.writeFileSync(
            path.join(projectPath, '..', 'client', 'vite.config.ts'),
            ViteConfBuilder.build(userOptions)
          )
          fs.writeFileSync(
            path.join(projectPath, '..', 'client', '.eslintrc.cjs'),
            ESLintConfBuilder.buildForViteReact()
          )

          break

        case 'vue':
          await sspawn(`cd ${rootPath} && ${yarnVersion} && yarn create vite client --template vue-ts`)
          fs.mkdirSync(path.join('.', appName, 'client', 'src', 'config'))

          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
            path.join(projectPath, '..', 'client', 'src', 'api')
          )
          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
            path.join(projectPath, '..', 'client', 'src', 'config', 'routes.ts')
          )

          fs.writeFileSync(
            path.join(projectPath, '..', 'client', 'vite.config.ts'),
            ViteConfBuilder.build(userOptions)
          )
          break

        case 'nuxt':
          await sspawn(`cd ${rootPath} && ${yarnVersion} && yarn create nuxt-app client`)

          fs.mkdirSync(path.join('.', appName, 'client', 'config'))

          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'api'),
            path.join(projectPath, '..', 'client', 'src', 'api')
          )
          copyRecursive(
            path.join(__dirname, '..', '..', 'boilerplate', 'client', 'config', 'routes.ts'),
            path.join(projectPath, '..', 'client', 'config', 'routes.ts')
          )

          break
      }

      if (!testEnv()) {
        // only bother installing packages if not in test env to save time
        await sspawn(`cd ${path.join(projectPath, '..', 'client')} && touch yarn.lock && yarn install`)
      }
    }

  if (!testEnv()) {
    // do not use git during tests, since this will break in CI
    await sspawn(`cd ${path.join('.', appName)} && git add --all && git commit -m 'psychic init' --quiet`)

    log.restoreCache()
    log.write(c.green(`Step 5. Build project: Done!`), { cache: true })
    console.log(welcomeMessage(appName))

    errors.forEach(err => {
      console.log(err)
    })
  }
}
