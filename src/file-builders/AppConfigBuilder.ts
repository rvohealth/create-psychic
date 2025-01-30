import fs from 'fs/promises'
import path from 'path'
import { NewAppCLIOptions } from '../helpers/gatherUserInput'

export default class AppConfigBuilder {
  public static async build(opts: { appName: string; userOptions: NewAppCLIOptions }) {
    const contents = (
      await fs.readFile(path.join(__dirname, '..', '..', 'boilerplate', 'api', 'src', 'conf', 'app.ts'))
    ).toString()

    return contents
      .replace(
        '<BACKGROUND_CONNECT>',
        opts.userOptions.backgroundWorkers ? '\n    background.connect()\n  ' : ''
      )
      .replace(
        '<BACKGROUND_IMPORT>',
        opts.userOptions.backgroundWorkers ? "\nimport { background } from '@rvohealth/psychic-workers'" : ''
      )
      .replace('<APP_NAME>', opts.appName)
      .replace('<API_ONLY>', opts.userOptions.apiOnly.toString())
  }
}
