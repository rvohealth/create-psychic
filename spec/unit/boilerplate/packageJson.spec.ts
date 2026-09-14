import { readFileSync } from 'fs'
import { join } from 'path'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  overrides?: unknown
  resolutions?: unknown
}

// Reads the static boilerplate package.json (copied verbatim into generated apps).
function readBoilerplatePackageJson(): PackageJson {
  const path = join(process.cwd(), 'boilerplate', 'api', 'package.json')
  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson
}

describe('boilerplate/api/package.json', () => {
  it('declares no dependency in both `dependencies` and `devDependencies`', () => {
    // npm/pnpm/yarn silently dedupe such a duplicate, but bun warns on it during install.
    const pkg = readBoilerplatePackageJson()
    const deps = Object.keys(pkg.dependencies ?? {})
    const devDeps = Object.keys(pkg.devDependencies ?? {})
    const duplicates = deps.filter(dep => devDeps.includes(dep))
    expect(duplicates).toEqual([])
  })

  it('uses parent dependency ranges instead of custom overrides or resolutions', () => {
    const pkg = readBoilerplatePackageJson()

    expect(pkg.overrides).toBeUndefined()
    expect(pkg.resolutions).toBeUndefined()
    expect(pkg.dependencies?.['@koa/router']).toBe('^15.7.0')
    expect(pkg.devDependencies?.express).toBe('4.22.3')
  })
})
