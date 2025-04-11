import * as fs from 'node:fs/promises'
import apiOnlyOptions from '../helpers/apiOnlyOptions.js'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class AppConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'app.ts'))
    ).toString()

    return contents
      .replace('<BACKGROUND_CONNECT>', options.workers ? '\n    background.connect()\n  ' : '')
      .replace(
        '<BACKGROUND_IMPORT>',
        options.workers
          ? "\nimport { background, PsychicApplicationWorkers } from '@rvoh/psychic-workers'"
          : ''
      )
      .replace(
        '<WS_IMPORT>',
        options.websockets ? "\nimport { PsychicApplicationWebsockets } from '@rvoh/psychic-websockets'" : ''
      )
      .replace('<DREAM_IMPORT_STATEMENT>', dreamImportStatement(options))
      .replace('<PACKAGE_MANAGER>', options.packageManager)
      .replace('<PSYCHIC_IMPORT_STATEMENT>', psychicImportStatement(options))
      .replace('<SERVER_START_HOOK>', startHookContent(options))
      .replace('<SERVER_SHUTDOWN_HOOK>', shutdownHookContent(options))
      .replace('<APP_NAME>', appName)
      .replace('<API_ONLY>', apiOnlyOptions(options).toString())
      .replace('<PSYCHIC_PLUGINS>', psychicPluginsContent(options))
      .replace(
        '<WS_CALLBACK_IMPORT>',
        options.websockets ? "\nimport websocketsCb from './websockets.js'" : ''
      )
      .replace('<WORKERS_CALLBACK_IMPORT>', options.workers ? "\nimport workersCb from './workers.js'" : '')
  }
}

function startHookContent(options: InitPsychicAppCliOptions) {
  if (options.client !== 'none' && options.adminClient !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('starting dev servers...')
      await PsychicDevtools.launchDevServer('clientApp', { port: 3000, cmd: 'yarn client' })
      await PsychicDevtools.launchDevServer('adminApp', { port: 3001, cmd: 'yarn admin' })
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else if (options.client !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('starting dev server...')
      await PsychicDevtools.launchDevServer('clientApp', { port: 3000, cmd: 'yarn client' })
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else if (options.adminClient !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('starting dev server...')
      await PsychicDevtools.launchDevServer('adminApp', { port: 3001, cmd: 'yarn admin' })
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else {
    return "  psy.on('server:start', () => {})"
  }
}

function shutdownHookContent(options: InitPsychicAppCliOptions) {
  if (options.client !== 'none' && options.adminClient !== 'none') {
    return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('stopping dev servers...')
      PsychicDevtools.stopDevServer('clientApp')
      PsychicDevtools.stopDevServer('adminApp')
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else if (options.client !== 'none') {
    return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('stopping dev server...')
      PsychicDevtools.stopDevServer('clientApp')
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else if (options.adminClient !== 'none') {
    return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('stopping dev server...')
      PsychicDevtools.stopDevServer('adminApp')
      DreamCLI.logger.logEndProgress()
    }
  })`
  } else {
    return "  psy.on('server:shutdown', () => {})"
  }
}

function psychicPluginsContent(options: InitPsychicAppCliOptions) {
  if (options.workers && options.websockets) {
    return `

  psy.plugin(async () => {
    await PsychicApplicationWebsockets.init(psy, websocketsCb)
  })
  psy.plugin(async () => {
    await PsychicApplicationWorkers.init(psy, workersCb)
  })`
  } else if (options.workers) {
    return `

  psy.plugin(async () => {
    await PsychicApplicationWorkers.init(psy, workersCb)
  })`
  } else if (options.websockets) {
    return `

  psy.plugin(async () => {
    await PsychicApplicationWebsockets.init(psy, websocketsCb)
  })`
  } else {
    return ''
  }
}

function dreamImportStatement(options: InitPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return ''
  }
  return "import { DreamCLI } from '@rvoh/dream'\n"
}

function psychicImportStatement(options: InitPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return "import { PsychicApplication } from '@rvoh/psychic'"
  }
  return "import { PsychicApplication, PsychicDevtools } from '@rvoh/psychic'"
}
