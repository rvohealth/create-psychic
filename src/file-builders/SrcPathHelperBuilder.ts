import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class SrcPathHelperBuilder {
  public static async build(options: NewPsychicAppCliOptions | InitPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'system', 'srcPath.ts'))
    ).toString()

    const confPath = (options as InitPsychicAppCliOptions).confPath || path.join('src', 'conf')
    const srcPathHelperFolder = path.join(confPath, 'system')
    const updirArr = srcPathHelperFolder.split(path.sep).map(() => "'..'")
    updirArr.pop()

    return contents.replace('<SRC_UPDIRS>', updirArr.join(', '))
  }
}
