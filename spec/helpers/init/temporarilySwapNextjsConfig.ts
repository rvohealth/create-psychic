import * as path from 'node:path'
import * as fs from 'node:fs/promises'

export default async function temporarilySwapNextjsConfig(
  newFileContents: string,
  cb: () => void | Promise<void>
) {
  const nextConfPath = path.join(process.cwd(), 'howyadoin', 'next.config.ts')
  const existingContents = (await fs.readFile(nextConfPath)).toString()

  await fs.writeFile(nextConfPath, newFileContents)
  await cb()
  await fs.writeFile(nextConfPath, existingContents)
}
