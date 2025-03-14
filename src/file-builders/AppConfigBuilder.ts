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
      .replace('<APP_NAME>', appName)
      .replace('<API_ONLY>', (options.client === 'none').toString())
  }
}
