import * as fs from 'fs/promises'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js.js'
import srcPath from '../helpers/srcPath.js.js'

export default class DreamConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(srcPath('..', 'boilerplate', 'api', 'src', 'conf', 'dream.ts'))
    ).toString()

    return contents.replace('<PRIMARY_KEY_TYPE>', `'${options.primaryKeyType}'`)
  }
}
