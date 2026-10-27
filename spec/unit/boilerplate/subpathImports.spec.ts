import { readFileSync } from 'node:fs'
import { join } from 'node:path'

function boilerplate(...segments: string[]) {
  return readFileSync(join(process.cwd(), 'boilerplate', 'api', ...segments), 'utf8')
}

// package.json `imports` is the app's one map of `#` names. tsconfig `paths` or a Vite
// `resolve.alias` would be a second map, and Bun applies tsconfig `paths` to dist/ too,
// so a built app run under Bun would load src/ instead.
describe("the template's # subpath imports", () => {
  it('compiles as nodenext, with no tsconfig paths or baseUrl', () => {
    const compilerOptions = (JSON.parse(boilerplate('tsconfig.build.json')) as { compilerOptions: object })
      .compilerOptions as Record<string, unknown>

    expect(compilerOptions.module).toEqual('nodenext')
    expect(compilerOptions.paths).toBeUndefined()
    expect(compilerOptions.baseUrl).toBeUndefined()
    expect(compilerOptions.rootDir).toEqual('./')
    expect(compilerOptions.outDir).toEqual('./dist')
  })

  it.each([['spec', 'unit', 'vite.config.ts'], ['spec', 'features', 'vite.config.ts']])(
    'leaves # resolution to package.json in %s/%s/%s',
    (...segments) => {
      const config = boilerplate(...segments)
      expect(config).not.toMatch(/\balias\b/)
      expect(config).not.toContain('srcPath')
    },
  )
})
