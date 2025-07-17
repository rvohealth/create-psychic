import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import safelyImportJsonFile from '../safelyImportJsonFile.js'
import addRootPathForCoreSpecs from './addRootPathForCoreSpecs.js'

export default async function addMissingTsconfigRules() {
  const userTsconfigPath = path.join(process.cwd(), addRootPathForCoreSpecs('tsconfig.json'))
  let userImported: { default: object }

  try {
    userImported = (await safelyImportJsonFile(userTsconfigPath)) as {
      default: object
    }

    // parse and stringify, since node caches this package.json import,
    // which will cause subsequent changes to this import to affect other specs
    const userTsconfig = {
      ...JSON.parse(JSON.stringify(userImported.default)),
    } as MockTsconfig

    userTsconfig.compilerOptions ||= {}
    userTsconfig.compilerOptions.strictPropertyInitialization = false

    await fs.writeFile(userTsconfigPath, JSON.stringify(userTsconfig, null, 2))
  } catch {
    // noop
  }
}

interface MockTsconfig {
  compilerOptions?: Record<string, string | boolean | number>
}
