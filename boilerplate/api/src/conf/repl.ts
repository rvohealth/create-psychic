import * as dotenv from 'dotenv'
import * as repl from 'node:repl'
import * as fs from 'fs/promises'
import * as path from 'path'

dotenv.config()

const replServer = repl.start('> ')
export default (async function () {
  const dreamPaths = await (await getFiles('./src/app/models')).filter(file => /\.ts$/.test(file))
  for (const dreamPath of dreamPaths) {
    const importablePath = dreamPath.replace(/.*\/src/, '..')
    const DreamClass = (await import(importablePath)).default
    replServer.context[(DreamClass as any).name] = DreamClass
  }
})()

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFiles(res) : res
    })
  )
  return Array.prototype.concat(...files)
}
