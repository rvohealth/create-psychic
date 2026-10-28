import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function boilerplate(...segments: string[]) {
  return readFileSync(join(process.cwd(), 'boilerplate', 'api', ...segments), 'utf8')
}

// package.json `imports` is the app's one map of `#` names.
describe("the template's # subpath imports", () => {
  it('compiles as nodenext into ./dist', () => {
    const compilerOptions = (JSON.parse(boilerplate('tsconfig.build.json')) as { compilerOptions: object })
      .compilerOptions as Record<string, unknown>

    expect(compilerOptions.module).toEqual('nodenext')
    expect(compilerOptions.rootDir).toEqual('./')
    expect(compilerOptions.outDir).toEqual('./dist')
  })
})
