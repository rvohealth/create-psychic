import readFile from './readFile'

export default async function expectFileContents(path: string, contents: string) {
  expect(await readFile(path)).toEqual(contents)
}
