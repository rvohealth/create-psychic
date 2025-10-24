import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import apiOnlyOptions from '../helpers/apiOnlyOptions.js'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import pathToArgs from '../helpers/pathToArgs.js'
import rewriteEsmImports from '../helpers/rewriteEsmImports.js'

export default class AppConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: NewPsychicAppCliOptions }) {
    const baseContents = await this.buildCommon({ appName, options })
    return baseContents
      .replace('<IMPORT_STYLE>', '')
      .replace(/<PSYCHIC_OPENAPI_PATH>/g, "'src', 'openapi'")
      .replace('<PSYCHIC_PATHS>', '')
      .replace('<CONTROLLERS_PATH>', "srcPath('app', 'controllers')")
      .replace('<SERVICES_PATH>', "srcPath('app', 'services')")
      .replace('<INITIALIZERS_PATH>', "srcPath('conf', 'initializers')")
  }

  public static async buildForInit({
    appName,
    options,
  }: {
    appName: string
    options: InitPsychicAppCliOptions
  }) {
    const baseContents = await this.buildCommon({ appName, options })
    const modifiedContents = baseContents
      .replace(
        '<IMPORT_STYLE>',
        options.importExtension === '.js'
          ? ''
          : `\n  psy.set('importExtension', '${options.importExtension}')`
      )
      .replace(/<PSYCHIC_OPENAPI_PATH>/g, pathToArgs(options.openapiPath))
      .replace('<CONTROLLERS_PATH>', `srcPath('..', ${pathToArgs(options.controllersPath)})`)
      .replace('<SERVICES_PATH>', `srcPath('..', ${pathToArgs(options.servicesPath)})`)
      .replace('<INITIALIZERS_PATH>', `srcPath('..', ${pathToArgs(options.confPath)}, 'initializers')`)
      .replace(
        '<PSYCHIC_PATHS>',
        `
  psy.set('paths', {
    apiRoutes: '${path.join(options.confPath, 'routes.ts')}',
    controllers: '${options.controllersPath}',
    services: '${options.servicesPath}',
    controllerSpecs: '${options.controllerSpecsPath}',
  })\
`
      )
      .replace(/AppEnv\.string\('SSL_KEY_PATH'\)/, "AppEnv.string('SSL_KEY_PATH', { optional: true })")
      .replace(/AppEnv\.string\('SSL_CERT_PATH'\)/, "AppEnv.string('SSL_CERT_PATH', { optional: true })")

    return options.importExtension === '.js'
      ? modifiedContents
      : rewriteEsmImports(modifiedContents, options.importExtension)
  }

  private static async buildCommon({
    appName,
    options,
  }: {
    appName: string
    options: NewPsychicAppCliOptions
  }) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'app.ts'))
    ).toString()

    return contents
      .replace('<DREAM_IMPORT_STATEMENT>', dreamImportStatement(options))
      .replace('<PACKAGE_MANAGER>', options.packageManager)
      .replace('<PSYCHIC_IMPORT_STATEMENT>', psychicImportStatement(options))
      .replace('<SERVER_START_HOOK>', startHookContent(options))
      .replace('<SERVER_SHUTDOWN_HOOK>', shutdownHookContent(options))
      .replace('<APP_NAME>', appName)
      .replace('<API_ONLY>', apiOnlyOptions(options).toString())
  }
}

function startHookContent(options: NewPsychicAppCliOptions) {
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

function shutdownHookContent(options: NewPsychicAppCliOptions) {
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

function dreamImportStatement(options: NewPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return ''
  }
  return "import { DreamCLI } from '@rvoh/dream'\n"
}

function psychicImportStatement(options: NewPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return "import { PsychicApp } from '@rvoh/psychic'"
  }
  return `import { PsychicApp } from '@rvoh/psychic'
import { PsychicDevtools } from '@rvoh/psychic/internal'`
}
