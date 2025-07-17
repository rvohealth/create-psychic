import * as fs from 'node:fs'
import * as path from 'node:path'

export default function copyRecursive(src: string, dest: string, fileCb?: (filecontents: string) => string) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && (stats as fs.Stats).isDirectory()
  if (isDirectory) {
    if (!['.', './.'].includes(dest)) fs.mkdirSync(dest, { recursive: true })

    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName), fileCb)
    })
  } else if (fileCb) {
    const contents = fs.readFileSync(src).toString()
    fs.writeFileSync(dest, fileCb ? fileCb(contents) : contents)
  } else {
    fs.copyFileSync(src, dest)
  }
}
