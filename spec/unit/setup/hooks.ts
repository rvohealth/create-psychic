import * as fs from 'fs/promises'
import { provideDreamViteMatchers } from '@rvoh/dream-spec-helpers'

provideDreamViteMatchers()

// define global context variable, setting it equal to describe
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).context = describe

beforeEach(async () => {
  try {
    await fs.rm('howyadoin', { force: true, recursive: true })
  } catch {
    //
  }
})

afterEach(async () => {
  try {
    await fs.rm('howyadoin', { force: true, recursive: true })
  } catch {
    //
  }
})
