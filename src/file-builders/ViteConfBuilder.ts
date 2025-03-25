import * as fs from 'fs/promises'

export default class ViteConfBuilder {
  public static async build(pathToExistingViteConf: string, { port = 3000 }: { port: number }) {
    const contents = (await fs.readFile(pathToExistingViteConf)).toString()
    return contents.replace(
      /\}\)/,
      `
  server: {
    port: ${port},
  },
})
`
    )
  }
}
