import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import { replacePackageManagerInFileContents } from '../helpers/replacePackageManagerInFile.js'

export default class FeatureSpecGlobalBuilder {
  public static async build({ options }: { appName: string; options: NewPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'api', 'spec', 'features', 'setup', 'globalSetup.ts'),
      )
    ).toString()

    return replacePackageManagerInFileContents(
      contents
        .replace('<PSYCHIC_IMPORTS>', psychicImports(options))
        .replace('<DEV_TOOLS_SETUP>', devToolsSetupContent(options))
        .replace('<DEV_TOOLS_TEARDOWN>', devToolsTeardownContent(options)),
      options.packageManager,
    )

    // TODO: replace yarn
  }
}

function psychicImports(options: NewPsychicAppCliOptions) {
  if (options.client === 'none' && options.adminClient === 'none' && options.internalClient === 'none') {
    return ''
  } else {
    return "\n\nimport { PsychicDevtools } from '@rvoh/psychic/system'"
  }
}

function devToolsSetupContent(options: NewPsychicAppCliOptions) {
  const servers: { name: string; port: number; cmd: string }[] = []

  if (options.client !== 'none')
    servers.push({ name: 'clientFspecApp', port: 3050, cmd: 'yarn client:fspec' })
  if (options.adminClient !== 'none')
    servers.push({ name: 'adminFspecApp', port: 3051, cmd: 'yarn admin:fspec' })
  if (options.internalClient !== 'none')
    servers.push({ name: 'internalFspecApp', port: 3052, cmd: 'yarn internal:fspec' })

  if (servers.length === 0) {
    return '  // global setup here...'
  }

  return servers
    .map(s => `  await PsychicDevtools.launchDevServer('${s.name}', { port: ${s.port}, cmd: '${s.cmd}' })`)
    .join('\n')
}

function devToolsTeardownContent(options: NewPsychicAppCliOptions) {
  const servers: string[] = []

  if (options.client !== 'none') servers.push('clientFspecApp')
  if (options.adminClient !== 'none') servers.push('adminFspecApp')
  if (options.internalClient !== 'none') servers.push('internalFspecApp')

  if (servers.length === 0) {
    return '  // global teardown here...'
  }

  return servers.map(s => `  PsychicDevtools.stopDevServer('${s}')`).join('\n')
}
