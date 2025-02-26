import * as c from 'colorette'
import * as fs from 'fs'

import path from 'path'
import AppConfigBuilder from '../file-builders/AppConfigBuilder'
import DreamConfigBuilder from '../file-builders/DreamConfigBuilder'
import EnvBuilder from '../file-builders/EnvBuilder'
import ESLintConfBuilder from '../file-builders/EslintConfBuilder'
import InitializePsychicAppBuilder from '../file-builders/InitializePsychicAppBuilder'
import PackagejsonBuilder from '../file-builders/PackagejsonBuilder'
import ViteConfBuilder from '../file-builders/ViteConfBuilder'
import copyRecursive from './copyRecursive'
import log from './log'
import logo from './logo'
import Select from './select'
import sleep from './sleep'
import sspawn from './sspawn'
import welcomeMessage from './welcomeMessage'
import addMissingClientGitignoreStatements from './addMissingClientGitignoreStatements'

export const cliPrimaryKeyTypes = ['bigserial', 'serial', 'uuid'] as const
export const cliClientAppTypes = ['react', 'vue', 'nuxt', 'api-only'] as const

export interface InitPsychicAppCliOptions {
  primaryKeyType: (typeof cliPrimaryKeyTypes)[number]
  client: (typeof cliClientAppTypes)[number]
  workers: boolean
  websockets: boolean
}

function testEnv() {
  return process.env.NODE_ENV === 'test'
}

export default async function newPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
  if (!options.primaryKeyType || !cliPrimaryKeyTypes.includes(options.primaryKeyType)) {
    const answer = await new Select('what primary key type would you like to use?', cliPrimaryKeyTypes).run()
    options.primaryKeyType = answer
  }

  if (!options.client || !cliClientAppTypes.includes(options.client)) {
    const answer = await new Select('which front end client would you like to use?', cliClientAppTypes).run()
    options.client = answer
  }

  if (options.workers === undefined) {
    const answer = await new Select('background workers?', ['yes', 'no'] as const).run()
    options.workers = answer === 'yes'
  }

  if (options.websockets === undefined) {
    const answer = await new Select('websockets?', ['yes', 'no'] as const).run()
    options.websockets = answer === 'yes'
  }

  if (!testEnv()) {
    log.clear()
    log.write(logo() + '\n\n', { cache: true })
    log.write(c.green(`Installing psychic framework to ./${appName}`), { cache: true })
    log.write(c.green(`Step 1. writing boilerplate to ${appName}...`))
  }

  let projectPath: string
  const rootPath = `./${appName}`

  if (options.client === 'api-only') {
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
  fs.writeFileSync(path.join(projectPath, 'package.json'), await PackagejsonBuilder.buildAPI(options))

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'app.ts'),
    await AppConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'conf', 'dream.ts'),
    await DreamConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(projectPath, 'src', 'cli', 'helpers', 'initializePsychicApplication.ts'),
    await InitializePsychicAppBuilder.build(options)
  )

  if (!options.workers) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'workers.ts'))
  }

  if (!options.websockets) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'websockets.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'helpers', 'ws.ts'))
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

  if (options.client !== 'api-only') {
    const yarnSetVersionCmd = 'corepack enable && yarn set version stable'

    switch (options.client) {
      case 'react':
        await sspawn(
          `cd ${rootPath} && yarn create vite client --template react-ts && cd client && touch yarn.lock && ${yarnSetVersionCmd}`
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
          ViteConfBuilder.build(options)
        )
        fs.writeFileSync(
          path.join(projectPath, '..', 'client', '.eslintrc.cjs'),
          ESLintConfBuilder.buildForViteReact()
        )

        break

      case 'vue':
        await sspawn(`cd ${rootPath} && ${yarnSetVersionCmd} && yarn create vite client --template vue-ts`)
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
          ViteConfBuilder.build(options)
        )
        break

      case 'nuxt':
        await sspawn(`cd ${rootPath} && ${yarnSetVersionCmd} && yarn create nuxt-app client`)

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

    addMissingClientGitignoreStatements(path.join(projectPath, '..', 'client', '.gitignore'))

    if (!testEnv() || process.env.REALLY_BUILD_CLIENT_DURING_SPECS === '1') {
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
