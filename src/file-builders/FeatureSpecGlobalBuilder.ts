import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import { replaceYarnAndNpxInFileContents } from '../helpers/replaceYarnAndNpxInFile.js'

export default class FeatureSpecGlobalBuilder {
  public static async build({ options }: { appName: string; options: NewPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'api', 'spec', 'features', 'setup', 'globalSetup.ts')
      )
    ).toString()

    return replaceYarnAndNpxInFileContents(
      contents
        .replace('<PSYCHIC_IMPORTS>', psychicImports(options))
        .replace('<DEV_TOOLS_SETUP>', devToolsSetupContent(options))
        .replace('<DEV_TOOLS_TEARDOWN>', devToolsTeardownContent(options)),
      options.packageManager
    )

    // TODO: replace yarn
  }
}

function psychicImports(options: NewPsychicAppCliOptions) {
  if (options.client === 'none' && options.adminClient === 'none') {
    return ''
  } else {
    return "\n\nimport { PsychicDevtools } from '@rvoh/psychic/system'"
  }
}

function devToolsSetupContent(options: NewPsychicAppCliOptions) {
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

function devToolsTeardownContent(options: NewPsychicAppCliOptions) {
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
