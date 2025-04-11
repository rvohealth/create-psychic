import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class DreamConfigBuilder {
  public static async build({ appName, options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'dream.ts'))
    ).toString()

    return contents.replace('<PRIMARY_KEY_TYPE>', `'${options.primaryKeyType}'`)
  }
}
