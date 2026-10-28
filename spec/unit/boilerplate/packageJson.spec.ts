import { readFileSync } from 'fs'
import { join } from 'path'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
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

  it('pins @koa/router and express', () => {
    const pkg = readBoilerplatePackageJson()

    expect(pkg.dependencies?.['@koa/router']).toBe('^15.7.0')
    expect(pkg.devDependencies?.express).toBe('4.22.3')
  })

  // Minimums rather than exact ranges, so raising a floor to a newer release needs no spec edit.
  it.each([
    // the first release with the `importAliasPrefix` setting, and the range psychic 3.18 peers
    ['@rvoh/dream', [2, 40, 0]],
    // the first release that forwards `psy.set('importExtension' | 'importAliasPrefix')` to Dream
    ['@rvoh/psychic', [3, 18, 0]],
    // the first release that closes the race between the template's `ws:connect` await and `Ws.register`
    ['@rvoh/psychic-websockets', [3, 5, 3]],
  ] as const)('floors %s at a caret range no lower than %j', (name, [minMajor, minMinor, minPatch]) => {
    const range = readBoilerplatePackageJson().dependencies?.[name]
    const match = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range ?? '')
    expect(match, `${name} is "${range}"`).not.toBeNull()

    const [major = -1, minor = -1, patch = -1] = (match ?? []).slice(1).map(Number)
    expect(major, `${name} is "${range}"`).toBe(minMajor)
    expect(minor > minMinor || (minor === minMinor && patch >= minPatch), `${name} is "${range}"`).toBe(true)
  })
})
