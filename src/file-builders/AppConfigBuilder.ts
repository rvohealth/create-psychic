import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import apiOnlyOptions from '../helpers/apiOnlyOptions.js'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import pathToArgs from '../helpers/pathToArgs.js'
import rewriteEsmImports from '../helpers/rewriteEsmImports.js'
import runCmdForPackageManager from '../helpers/packageManager/runCmdForPackageManager.js'

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
          : `\n  psy.set('importExtension', '${options.importExtension}')`,
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
`,
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
  const runCmd = runCmdForPackageManager(options.packageManager)
  const servers: { name: string; port: number; cmd: string }[] = []

  if (options.client !== 'none') servers.push({ name: 'clientApp', port: 3000, cmd: `${runCmd} client` })
  if (options.adminClient !== 'none') servers.push({ name: 'adminApp', port: 3001, cmd: `${runCmd} admin` })
  if (options.internalClient !== 'none')
    servers.push({ name: 'internalApp', port: 3002, cmd: `${runCmd} internal` })

  if (servers.length === 0) {
    return "  psy.on('server:start', () => {})"
  }

  const plural = servers.length > 1 ? 'servers' : 'server'
  const launchLines = servers
    .map(s => `      await PsychicDevtools.launchDevServer('${s.name}', { port: ${s.port}, cmd: '${s.cmd}' })`)
    .join('\n')

  return `\
  psy.on('server:start', async () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('starting dev ${plural}...')
${launchLines}
      DreamCLI.logger.logEndProgress()
    }
  })`
}

function shutdownHookContent(options: NewPsychicAppCliOptions) {
  const servers: string[] = []

  if (options.client !== 'none') servers.push('clientApp')
  if (options.adminClient !== 'none') servers.push('adminApp')
  if (options.internalClient !== 'none') servers.push('internalApp')

  if (servers.length === 0) {
    return "  psy.on('server:shutdown', () => {})"
  }

  const plural = servers.length > 1 ? 'servers' : 'server'
  const stopLines = servers
    .map(s => `      PsychicDevtools.stopDevServer('${s}')`)
    .join('\n')

  return `\
  psy.on('server:shutdown', () => {
    if (AppEnv.isDevelopment && AppEnv.boolean('CLIENT')) {
      DreamCLI.logger.logStartProgress('stopping dev ${plural}...')
${stopLines}
      DreamCLI.logger.logEndProgress()
    }
  })`
}

function dreamImportStatement(options: NewPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return ''
  }
  return "import { DreamCLI } from '@rvoh/dream/system'\n"
}

function psychicImportStatement(options: NewPsychicAppCliOptions) {
  if (apiOnlyOptions(options)) {
    return "import { PsychicApp } from '@rvoh/psychic'"
  }
  return `import { PsychicApp } from '@rvoh/psychic'
import { PsychicDevtools } from '@rvoh/psychic/system'`
}
