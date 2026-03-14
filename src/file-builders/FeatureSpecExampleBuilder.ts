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

    return contents.replace('<ASSERTION_TEXT>', assertionText(options))
  }
}

function assertionText(options: NewPsychicAppCliOptions) {
  switch (options.client) {
    case 'none':
      return '<TEXT_FROM_YOUR_CLIENT_APP_HERE>'

    case 'nextjs':
      return 'get started'

    default:
      return 'Get started'
  }
}
