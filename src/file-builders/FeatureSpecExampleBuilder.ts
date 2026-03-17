import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class FeatureSpecExampleBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'api', 'spec', 'features', 'example-feature-spec.spec.ts'),
      )
    ).toString()

    return contents
      .replace('<ASSERTION_TEXT>', assertionText(options))
      .replace('<CLIENT_PORT>', clientPort(options).toString())
  }
}

function clientPort(options: NewPsychicAppCliOptions) {
  if (options.client !== 'none') return 3050
  if (options.adminClient !== 'none') return 3051
  if (options.internalClient !== 'none') return 3052
  return 3050
}

function assertionText(options: NewPsychicAppCliOptions) {
  switch (options.client) {
    case 'none':
      return '<TEXT_FROM_YOUR_CLIENT_APP_HERE>'

    default:
      return 'Get started'
  }
}
