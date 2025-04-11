import fs from 'node:fs/promises'

export default async function readFile(path: string) {
  return (await fs.readFile(path)).toString()
}
