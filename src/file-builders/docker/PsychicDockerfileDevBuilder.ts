import * as fs from 'node:fs/promises'
import internalSrcPath from '../../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions, PsychicPackageManager } from '../../helpers/newPsychicApp.js'
import { replacePackageManagerInFileContents } from '../../helpers/replacePackageManagerInFile.js'

export default class PsychicDockerDevBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    return await this.buildForPackageManager(options.packageManager)
  }

  // The `Dockerfile.dev` of the api and of each client, for the package manager that
  // drives it. Bun is its own runtime and package manager, so its image is Bun's own,
  // which has no corepack and a `bun` user in place of `node`. Every other package
  // manager, Deno's included, gets the Node image, where corepack provides pnpm and yarn.
  public static async buildForPackageManager(packageManager: PsychicPackageManager) {
    const dockerfile = packageManager === 'bun' ? 'Dockerfile.bun.dev' : 'Dockerfile.dev'
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'additional', 'docker', 'psychic', dockerfile))
    ).toString()

    return replacePackageManagerInFileContents(contents, packageManager)
  }
}
