import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import { replaceYarnAndNpxInFileContents } from '../helpers/replaceYarnAndNpxInFile.js'
import safelyImportJsonFile from '../helpers/safelyImportJsonFile.js'

export default class PackagejsonBuilder {
  public static async buildAPI(appName: string, options: NewPsychicAppCliOptions) {
    const imported = (await safelyImportJsonFile('../../boilerplate/api/package.json')) as { default: object }

    // parse and stringify, since node caches this package.json import,
    // which will cause subsequent changes to this import to affect other specs
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const packagejson = {
      ...JSON.parse(JSON.stringify(imported.default)),
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    packagejson.name = appName

    switch (options.client) {
      case 'none':
        break

      case 'nextjs':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        packagejson.scripts['client'] = `yarn --cwd=../client next dev`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        packagejson.scripts['client:fspec'] =
          `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test yarn --cwd=../client next dev`
        break

      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        packagejson.scripts['client'] = `yarn --cwd=../client dev`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        packagejson.scripts['client:fspec'] = `BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../client dev`
    }

    switch (options.adminClient) {
      case 'none':
        break

      default:
        switch (options.adminClient) {
          case 'nextjs':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            packagejson.scripts['admin'] = `yarn --cwd=../admin next dev`
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            packagejson.scripts['admin:fspec'] =
              `BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test yarn --cwd=../admin next dev --port 3001`
            break

          default:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            packagejson.scripts['admin'] = `yarn --cwd=../admin dev`
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            packagejson.scripts['admin:fspec'] =
              `BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../admin dev --port 3001`
        }
    }

    if (!options.workers) {
      removeDependency(packagejson, '@rvoh/psychic-workers')
      removeDependency(packagejson, 'bullmq')
      removeDependency(packagejson, '@bull-board/express')
    }

    if (!options.websockets) {
      removeDependency(packagejson, '@rvoh/psychic-websockets')
      removeDependency(packagejson, '@socket.io/redis-adapter')
      removeDependency(packagejson, '@socket.io/redis-emitter')
      removeDependency(packagejson, 'socket.io')
      removeDependency(packagejson, 'socket.io-adapter')
    }

    if (!options.workers && !options.websockets) {
      removeDependency(packagejson, 'ioredis')
    }

    return replaceYarnAndNpxInFileContents(JSON.stringify(packagejson, null, 2), options.packageManager)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeDependency(packageJson: any, key: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  delete packageJson.dependencies[key]
}
