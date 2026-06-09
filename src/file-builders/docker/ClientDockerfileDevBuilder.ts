import * as fs from 'node:fs/promises'
import frontEndPackageManager from '../../helpers/frontEndPackageManager.js'
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

    // A client is a Node-ecosystem artifact even when the API runtime is Deno, so
    // its Dockerfile resolves against the front-end PM (pnpm for a Deno API), never
    // the API runtime — otherwise a Deno app's client image would emit `deno` commands.
    return replacePackageManagerInFileContents(contents, frontEndPackageManager(options))
  }
}
