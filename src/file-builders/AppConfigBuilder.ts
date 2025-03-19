import * as fs from 'fs/promises'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import srcPath from '../helpers/srcPath.js'

export default class AppConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(srcPath('..', 'boilerplate', 'api', 'src', 'conf', 'app.ts'))
    ).toString()

    return contents
      .replace('<BACKGROUND_CONNECT>', options.workers ? '\n    background.connect()\n  ' : '')
      .replace(
        '<BACKGROUND_IMPORT>',
        options.workers ? "\nimport { background } from '@rvoh/psychic-workers'" : ''
      )
      .replace('<DREAM_IMPORT_STATEMENT>', dreamImportStatement(options))
      .replace('<PSYCHIC_IMPORT_STATEMENT>', psychicImportStatement(options))
      .replace('<SERVER_START_HOOK>', startHookContent(options))
      .replace('<SERVER_SHUTDOWN_HOOK>', shutdownHookContent(options))
      .replace('<APP_NAME>', appName)
      .replace('<API_ONLY>', (options.client === 'none' && options.adminClient === 'none').toString())
  }
}

function startHookContent(options: InitPsychicAppCliOptions) {
  if (options.client !== 'none' && options.adminClient !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      const spinner = DreamCLI.logger.log('starting dev servers...', { spinner: true })
      await PsychicDevtools.launchDevServer('clientApp', { port: 3000, cmd: 'yarn client' })
      await PsychicDevtools.launchDevServer('adminApp', { port: 3001, cmd: 'yarn admin' })
      spinner.stop()
    }
  })`
  } else if (options.client !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      const spinner = DreamCLI.logger.log('starting dev server...', { spinner: true })
      await PsychicDevtools.launchDevServer('clientApp', { port: 3000, cmd: 'yarn client' })
      spinner.stop()
    }
  })`
  } else if (options.adminClient !== 'none') {
    return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      const spinner = DreamCLI.logger.log('starting dev server...', { spinner: true })
      await PsychicDevtools.launchDevServer('adminApp', { port: 3001, cmd: 'yarn admin' })
      spinner.stop()
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
      const spinner = DreamCLI.logger.log('stopping dev servers...', { spinner: true })
      PsychicDevtools.stopDevServer('clientApp')
      PsychicDevtools.stopDevServer('adminApp')
      spinner.stop()
    }
  })`
  } else if (options.client !== 'none') {
    return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      const spinner = DreamCLI.logger.log('stopping dev server...', { spinner: true })
      PsychicDevtools.stopDevServer('clientApp')
      spinner.stop()
    }
  })`
  } else if (options.adminClient !== 'none') {
    return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      const spinner = DreamCLI.logger.log('stopping dev server...', { spinner: true })
      PsychicDevtools.stopDevServer('adminApp')
      spinner.stop()
    }
  })`
  } else {
    return "  psy.on('server:shutdown', () => {})"
  }
}

function dreamImportStatement(options: InitPsychicAppCliOptions) {
  if (options.client === 'none' && options.adminClient === 'none') {
    return ''
  }
  return "import { DreamCLI } from '@rvoh/dream'\n"
}

function psychicImportStatement(options: InitPsychicAppCliOptions) {
  if (options.client === 'none' && options.adminClient === 'none') {
    return "import { PsychicApplication } from '@rvoh/psychic'"
  }
  return "import { PsychicApplication, PsychicDevtools } from '@rvoh/psychic'"
}
