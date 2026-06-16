import { readFileSync } from 'fs'
import { join } from 'path'

// Reads the static boilerplate package.json (copied verbatim into generated apps).
function readBoilerplatePackageJson(): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } {
  const path = join(process.cwd(), 'boilerplate', 'api', 'package.json')
  return JSON.parse(readFileSync(path, 'utf8'))
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
})
