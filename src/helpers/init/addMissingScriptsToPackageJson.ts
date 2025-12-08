import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import safelyImportJsonFile from '../safelyImportJsonFile.js'
import addRootPathForCoreSpecs from './addRootPathForCoreSpecs.js'
import { InitPsychicAppCliOptions } from '../newPsychicApp.js'

export default async function addMissingScriptsToPackageJson(options: InitPsychicAppCliOptions) {
  const userPackagejsonPath = path.join(process.cwd(), addRootPathForCoreSpecs('package.json'))
  const userImported = (await safelyImportJsonFile(userPackagejsonPath)) as {
    default: object
  }

  // parse and stringify, since node caches this package.json import,
  // which will cause subsequent changes to this import to affect other specs
  const userPackagejson = {
    ...JSON.parse(JSON.stringify(userImported.default)),
  } as MockPackageJson

  userPackagejson.type = 'module'

  const psyOrDreamCmd = options.dreamOnly ? 'dream' : 'psy'
  userPackagejson.scripts[psyOrDreamCmd] = `NODE_ENV=\${NODE_ENV:-test} tsx ${path.join(
    options.confPath,
    'system',
    'cli.ts',
  )}`
  userPackagejson.scripts['uspec'] =
    `APP_NAME=$npm_package_name APP_VERSION=$npm_package_version vitest --config ./spec/unit/vite.config.ts`

  await fs.writeFile(userPackagejsonPath, JSON.stringify(userPackagejson, null, 2))
}

interface MockPackageJson {
  type: string
  scripts: Record<string, string>
}
