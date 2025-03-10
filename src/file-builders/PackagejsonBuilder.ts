import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp'

export default class PackagejsonBuilder {
  public static async buildAPI(options: InitPsychicAppCliOptions) {
    // parse and stringify, since node caches this package.json import,
    // which will cause subsequent changes to this import to affect other specs
    const packagejson = {
      ...JSON.parse(
        JSON.stringify(
          // @ts-ignore
          ((await import('../../boilerplate/api/package.json', { assert: { type: 'json' } })) as any).default
        )
      ),
    }

    switch (options.client) {
      case 'react':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        ;(packagejson.scripts as any)['client'] = `PORT=3000 yarn --cwd=../client dev`
    }

    if (!options.workers) {
      removeDependency(packagejson, '@rvohealth/psychic-workers')
      removeDependency(packagejson, 'bullmq')
      removeDependency(packagejson, '@bull-board/express')
    }

    if (!options.websockets) {
      removeDependency(packagejson, '@rvohealth/psychic-websockets')
      removeDependency(packagejson, '@socket.io/redis-adapter')
      removeDependency(packagejson, '@socket.io/redis-emitter')
      removeDependency(packagejson, 'socket.io')
      removeDependency(packagejson, 'socket.io-adapter')
    }

    if (!options.workers && !options.websockets) {
      removeDependency(packagejson, 'ioredis')
    }

    return JSON.stringify(packagejson, null, 2)
  }
}

function removeDependency(packageJson: any, key: string) {
  delete packageJson.dependencies[key]
}
