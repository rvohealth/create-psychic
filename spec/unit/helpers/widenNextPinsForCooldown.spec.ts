import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import widenNextPinsForCooldown from '../../../src/helpers/widenNextPinsForCooldown.js'

describe('widenNextPinsForCooldown', () => {
  it('widens exact Next pins to the full major range so the age gate can select a mature release', () => {
    const packageJsonPath = writePackageJson({
      dependencies: { next: '16.2.11', react: '^19.0.0' },
      devDependencies: { 'eslint-config-next': '16.2.11', typescript: '^5.9.3' },
    })

    widenNextPinsForCooldown(packageJsonPath)

    expect(readPackageJson(packageJsonPath)).toEqual({
      dependencies: { next: '^16.0.0', react: '^19.0.0' },
      devDependencies: { 'eslint-config-next': '^16.0.0', typescript: '^5.9.3' },
    })
  })

  it('widens minor-restricted ranges because they still exclude mature releases from earlier minors', () => {
    const packageJsonPath = writePackageJson({
      dependencies: { next: '^17.1.2' },
      devDependencies: { 'eslint-config-next': '~17.1.2' },
    })

    widenNextPinsForCooldown(packageJsonPath)

    expect(readPackageJson(packageJsonPath)).toEqual({
      dependencies: { next: '^17.0.0' },
      devDependencies: { 'eslint-config-next': '^17.0.0' },
    })
  })

  it('leaves unrelated dependencies unchanged', () => {
    const original = {
      dependencies: { react: '^19.0.0' },
      devDependencies: { typescript: '^5.9.3' },
    }
    const packageJsonPath = writePackageJson(original)

    widenNextPinsForCooldown(packageJsonPath)

    expect(readPackageJson(packageJsonPath)).toEqual(original)
  })
})

function writePackageJson(pkg: object) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-psychic-next-cooldown-'))
  const packageJsonPath = path.join(dir, 'package.json')
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
  return packageJsonPath
}

function readPackageJson(packageJsonPath: string) {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as object
}
