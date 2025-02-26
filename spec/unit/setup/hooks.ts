import fs from 'fs/promises'

beforeEach(async () => {
  try {
    await fs.rm('howyadoin', { force: true, recursive: true })
  } catch {
    //
  }
})

afterEach(async () => {
  // try {
  //   await fs.rm('howyadoin', { force: true, recursive: true })
  // } catch {
  //   //
  // }
})
