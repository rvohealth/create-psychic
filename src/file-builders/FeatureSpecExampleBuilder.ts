import * as fs from 'fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class FeatureSpecExampleBuilder {
  public static async build(options: InitPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'api', 'spec', 'features', 'example-feature-spec.spec.ts')
      )
    ).toString()

    return contents.replace('<ASSERTION_TEXT>', assertionText(options))
  }
}

function assertionText(options: InitPsychicAppCliOptions) {
  switch (options.client) {
    case 'none':
      return '<TEXT_FROM_YOUR_CLIENT_APP_HERE>'

    case 'nextjs':
      return options.client

    default:
      // generally speaking, the home page of any
      // front-end client application will typically
      // have their name on the home page, capitalized.
      //
      // for those that have it non-capitalized,
      // they should be handled in the previous case block
      return capitaize(options.client)
  }
}

function capitaize(str: string) {
  return (str[0] ?? '').toUpperCase() + str.slice(1)
}
