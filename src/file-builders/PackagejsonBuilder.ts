import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import { replaceYarnInFileContents } from '../helpers/replaceYarnInFile.js'

export default class PackagejsonBuilder {
  public static async buildAPI(appName: string, options: InitPsychicAppCliOptions) {
    // node 20 requires us to user "assert"
    // node >22 requires us to user "with"
    // @ts-ignore
    const imported = (await import('../../boilerplate/api/package.json', {
      assert: { type: 'json' },
      // @ts-ignore
      with: { type: 'json' },
    })) as any

    // parse and stringify, since node caches this package.json import,
    // which will cause subsequent changes to this import to affect other specs
    const packagejson = {
      ...JSON.parse(JSON.stringify(imported.default)),
    }

    packagejson.name = appName

    switch (options.client) {
      case 'none':
        break

      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        ;(packagejson.scripts as any)['client'] = `yarn --cwd=../client dev`
        ;(packagejson.scripts as any)['client:fspec'] = `VITE_PSYCHIC_ENV=test yarn --cwd=../client dev`
    }

    switch (options.adminClient) {
      case 'none':
        break

      default:
        switch (options.adminClient) {
          case 'nextjs':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            ;(packagejson.scripts as any)['admin'] = `yarn --cwd=../admin dev --port 3001`
            ;(packagejson.scripts as any)[
              'admin:fspec'
            ] = `VITE_PSYCHIC_ENV=test yarn --cwd=../admin dev --port 3001`
            break

          default:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            ;(packagejson.scripts as any)['admin'] = `yarn --cwd=../admin dev`
            ;(packagejson.scripts as any)['admin:fspec'] = `VITE_PSYCHIC_ENV=test yarn --cwd=../admin dev`
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

    return replaceYarnInFileContents(JSON.stringify(packagejson, null, 2), options.packageManager)
  }
}

function removeDependency(packageJson: any, key: string) {
  delete packageJson.dependencies[key]
}
