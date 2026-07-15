import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import ensureNextCompatibleTypescript, {
  NEXT_COMPATIBLE_TYPESCRIPT_RANGE,
} from '../../../src/helpers/ensureNextCompatibleTypescript.js'

describe('ensureNextCompatibleTypescript', () => {
  it('keeps Next apps on the TypeScript compiler major Next can load', () => {
    const packageJsonPath = writePackageJson({
      dependencies: { next: '^16.0.0' },
      devDependencies: { typescript: '^7.0.2' },
    })

    ensureNextCompatibleTypescript(packageJsonPath)

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      devDependencies: Record<string, string>
    }
    expect(pkg.devDependencies.typescript).toEqual(NEXT_COMPATIBLE_TYPESCRIPT_RANGE)
  })

  it('does not change non-Next apps', () => {
    const original = {
      dependencies: { react: '^19.0.0' },
      devDependencies: { typescript: '^7.0.2' },
    }
    const packageJsonPath = writePackageJson(original)

    ensureNextCompatibleTypescript(packageJsonPath)

    expect(JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))).toEqual(original)
  })
})

function writePackageJson(pkg: object) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-psychic-next-ts-'))
  const packageJsonPath = path.join(dir, 'package.json')
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
  return packageJsonPath
}
