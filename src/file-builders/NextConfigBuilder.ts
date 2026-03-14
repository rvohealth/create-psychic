import * as fs from 'node:fs/promises'

export default class NextConfigBuilder {
  public static async build(pathToExistingNextConfig: string) {
    const contents = (await fs.readFile(pathToExistingNextConfig)).toString()

    // Handle empty config object: `NextConfig = {};`
    const emptyConfigPattern = /NextConfig\s*=\s*\{\s*\}/
    if (emptyConfigPattern.test(contents)) {
      return contents.replace(
        emptyConfigPattern,
        `NextConfig = {\n  distDir: process.env.NEXT_DIST_DIR ?? ".next",\n}`,
      )
    }

    // Handle config object with existing properties: `NextConfig = {\n`
    return contents.replace(
      /NextConfig\s*=\s*\{/,
      `NextConfig = {\n  distDir: process.env.NEXT_DIST_DIR ?? ".next",`,
    )
  }
}
