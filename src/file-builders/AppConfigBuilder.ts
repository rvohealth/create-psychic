import * as fs from 'fs/promises'
import * as path from 'path'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp'

export default class AppConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(path.join(__dirname, '..', '..', 'boilerplate', 'api', 'src', 'conf', 'app.ts'))
    ).toString()

    return contents
      .replace('<BACKGROUND_CONNECT>', options.workers ? '\n    background.connect()\n  ' : '')
      .replace(
        '<BACKGROUND_IMPORT>',
        options.workers ? "\nimport { background } from '@rvohealth/psychic-workers'" : ''
      )
      .replace('<APP_NAME>', appName)
      .replace('<API_ONLY>', (options.client === 'none').toString())
  }
}
