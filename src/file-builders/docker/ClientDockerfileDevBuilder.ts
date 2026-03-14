import * as fs from 'node:fs/promises'
import internalSrcPath from '../../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../../helpers/newPsychicApp.js'
import { replacePackageManagerInFileContents } from '../../helpers/replacePackageManagerInFile.js'

export default class ClientDockerDevBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'additional', 'docker', 'psychic', 'Dockerfile.dev'),
      )
    ).toString()

    return replacePackageManagerInFileContents(contents, options.packageManager)
  }
}
