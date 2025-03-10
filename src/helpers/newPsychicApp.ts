import * as c from 'colorette'
import * as fs from 'fs'
import * as path from 'path'
import AppConfigBuilder from '../file-builders/AppConfigBuilder.js'
import DreamConfigBuilder from '../file-builders/DreamConfigBuilder.js'
import EnvBuilder from '../file-builders/EnvBuilder.js'
import InitializePsychicAppBuilder from '../file-builders/InitializePsychicAppBuilder.js'
import PackagejsonBuilder from '../file-builders/PackagejsonBuilder.js'
import addClientApp from './addClientApp.js'
import copyRecursive from './copyRecursive.js'
import log from './log.js'
import logo from './logo.js'
import Select from './select.js'
import sleep from './sleep.js'
import sspawn from './sspawn.js'
import welcomeMessage from './welcomeMessage.js'
import srcPath from './srcPath.js'

export const cliPrimaryKeyTypes = ['bigserial', 'serial', 'uuid'] as const
export const cliClientAppTypes = ['react', 'vue', 'nuxt', 'none'] as const

export interface InitPsychicAppCliOptions {
  primaryKeyType: (typeof cliPrimaryKeyTypes)[number]
  client: (typeof cliClientAppTypes)[number]
  adminClient: (typeof cliClientAppTypes)[number]
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

  if (!options.adminClient || !cliClientAppTypes.includes(options.adminClient)) {
    const answer = await new Select(
      'which front end client would you like to use for your admin app?',
      cliClientAppTypes
    ).run()
    options.adminClient = answer
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

  if (options.client === 'none') {
    projectPath = path.join('.', appName)
    copyRecursive(srcPath('..', 'boilerplate', 'api'), path.join('.', appName))
  } else {
    projectPath = srcPath('..', appName, 'api')
    fs.mkdirSync(`./${appName}`)
    copyRecursive(srcPath('..', 'boilerplate', 'api'), projectPath)
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
    path.join(projectPath, 'src', 'conf', 'initializePsychicApplication.ts'),
    await InitializePsychicAppBuilder.build(options)
  )

  if (!options.workers) {
    fs.rmSync(path.join(projectPath, 'src', 'conf', 'workers.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'models', 'ApplicationBackgroundedModel.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'services', 'ApplicationBackgroundedService.ts'))
    fs.rmSync(path.join(projectPath, 'src', 'app', 'services', 'ApplicationScheduledService.ts'))
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

  if (options.client !== 'none') {
    await addClientApp({
      client: options.client,
      clientRootFolderName: 'client',
      appName,
      projectPath,
      options,
      rootPath,
    })
  }

  if (options.adminClient !== 'none') {
    await addClientApp({
      client: options.adminClient,
      clientRootFolderName: 'admin',
      appName,
      projectPath,
      options,
      rootPath,
    })
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
