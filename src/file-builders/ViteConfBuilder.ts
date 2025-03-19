import * as fs from 'fs/promises'

export default class ViteConfBuilder {
  public static async build(pathToExistingViteConf: string) {
    const contents = (await fs.readFile(pathToExistingViteConf)).toString()
    return contents.replace(
      /\}\)/,
      `
  server: {
    port: 3000,
  },
})
`
    )
  }
}
