import frontEndPackageManager from '../../helpers/frontEndPackageManager.js'
import { NewPsychicAppCliOptions } from '../../helpers/newPsychicApp.js'
import PsychicDockerDevBuilder from './PsychicDockerfileDevBuilder.js'

export default class ClientDockerDevBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    // A client is a Node-ecosystem artifact even when the API runtime is Deno, so
    // its Dockerfile resolves against the front-end PM (pnpm for a Deno API), never
    // the API runtime — otherwise a Deno app's client image would emit `deno` commands.
    // Bun drives a Bun app's clients, so they get the Bun image.
    return await PsychicDockerDevBuilder.buildForPackageManager(frontEndPackageManager(options))
  }
}
