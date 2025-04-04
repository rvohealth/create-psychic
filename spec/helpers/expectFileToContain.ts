import readFile from './readFile.js'

export default async function expectFileToContain(path: string, contents: string) {
  expect((await readFile(path)).includes(contents)).toBe(true)
}
