import * as fs from 'fs/promises'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import { replaceYarnInFileContents } from '../helpers/replaceYarnInFile.js'
import srcPath from '../helpers/srcPath.js'

export default class FeatureSpecGlobalBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(srcPath('..', 'boilerplate', 'api', 'spec', 'features', 'setup', 'globalSetup.ts'))
    ).toString()

    return replaceYarnInFileContents(
      contents
        .replace('<PSYCHIC_IMPORTS>', psychicImports(options))
        .replace('<DEV_TOOLS_SETUP>', devToolsSetupContent(options))
        .replace('<DEV_TOOLS_TEARDOWN>', devToolsTeardownContent(options)),
      options.packageManager
    )

    // TODO: replace yarn
  }
}

function psychicImports(options: InitPsychicAppCliOptions) {
  if (options.client === 'none' && options.adminClient === 'none') {
    return ''
  } else {
    return "\n\nimport { PsychicDevtools } from '@rvoh/psychic'"
  }
}

function devToolsSetupContent(options: InitPsychicAppCliOptions) {
  if (options.client !== 'none' && options.adminClient !== 'none') {
    return `\
  await PsychicDevtools.launchDevServer('clientFspecApp', { port: 3000, cmd: 'yarn client:fspec' })
  await PsychicDevtools.launchDevServer('adminFspecApp', { port: 3001, cmd: 'yarn admin:fspec' })`
  } else if (options.client !== 'none') {
    return `\
  await PsychicDevtools.launchDevServer('clientFspecApp', { port: 3000, cmd: 'yarn client:fspec' })`
  } else if (options.adminClient !== 'none') {
    return `\
  await PsychicDevtools.launchDevServer('adminFspecApp', { port: 3001, cmd: 'yarn admin:fspec' })`
  } else {
    return '  // global setup here...'
  }
}

function devToolsTeardownContent(options: InitPsychicAppCliOptions) {
  if (options.client !== 'none' && options.adminClient !== 'none') {
    return `\
  PsychicDevtools.stopDevServer('clientFspecApp')
  PsychicDevtools.stopDevServer('adminFspecApp')`
  } else if (options.client !== 'none') {
    return `\
  PsychicDevtools.stopDevServer('clientFspecApp')`
  } else if (options.adminClient !== 'none') {
    return `\
  PsychicDevtools.stopDevServer('adminFspecApp')`
  } else {
    return '  // global teardown here...'
  }
}
