import fs from 'fs/promises'

export default async function expectFile(path: string) {
  let isFile = false
  try {
    const res = await fs.stat(path)
    isFile = res.isFile()
  } catch {
    // noop
  }

  expect(isFile).toBe(true)
}
