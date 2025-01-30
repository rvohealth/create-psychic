import fs from 'fs/promises'

export default async function readFile(path: string) {
  return (await fs.readFile(path)).toString()
}
