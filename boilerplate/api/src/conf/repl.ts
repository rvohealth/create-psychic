import * as dotenv from 'dotenv'
import * as repl from 'node:repl'
import * as fs from 'fs/promises'
import * as path from 'path'

dotenv.config({ path: '.env' })

const replServer = repl.start('> ')
export default (async function () {
  const dreamPaths = (await getFiles('./src/app/models')).filter(file => /\.ts$/.test(file))
  for (const dreamPath of dreamPaths) {
    const importablePath = dreamPath.replace(/.*\/src/, '..')

    if (isImportable(importablePath)) {
      const DreamClass = (await import(importablePath)).default
      replServer.context[await globalName(DreamClass, importablePath)] = DreamClass
    }
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

let pascalize: any
async function globalName(dreamClassOrIndexFile: any, importablePath: string) {
  // need to import from psychic dynamically, or else database
  // credentials get messed up.
  if (!pascalize) pascalize = (await import('psychic')).pascalize

  if (dreamClassOrIndexFile?.isDream) return (dreamClassOrIndexFile as any).name
  else {
    const paths = importablePath.split('/')
    return pascalize(paths[paths.length - 2])
  }
}

function isImportable(file: string) {
  return file.split('/').length === 4 || (file.split('/').length === 5 && /index.ts$/.test(file))
}
