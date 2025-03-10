import * as fs from 'fs/promises'
import * as path from 'path'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class DreamConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(path.join(__dirname, '..', '..', 'boilerplate', 'api', 'src', 'conf', 'dream.ts'))
    ).toString()

    return contents.replace('<PRIMARY_KEY_TYPE>', `'${options.primaryKeyType}'`)
  }
}
