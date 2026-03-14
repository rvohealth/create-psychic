import * as fs from 'node:fs/promises'

export default class NuxtConfigBuilder {
  public static async build(pathToExistingNuxtConfig: string) {
    const contents = (await fs.readFile(pathToExistingNuxtConfig)).toString()

    // Handle empty config object: `defineNuxtConfig({})`
    const emptyConfigPattern = /defineNuxtConfig\(\s*\{\s*\}\s*\)/
    if (emptyConfigPattern.test(contents)) {
      return contents.replace(
        emptyConfigPattern,
        `defineNuxtConfig({\n  buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt",\n})`,
      )
    }

    // Handle config object with existing properties: `defineNuxtConfig({\n`
    return contents.replace(
      /defineNuxtConfig\(\s*\{/,
      `defineNuxtConfig({\n  buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt",`,
    )
  }
}
