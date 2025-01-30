import { NewAppCLIOptions } from '../helpers/gatherUserInput'
import boilerplatePackageJson from '../../boilerplate/api/package.json'

export default class PackagejsonBuilder {
  public static async buildAPI(userOptions: NewAppCLIOptions) {
    const packagejson = JSON.parse(JSON.stringify(boilerplatePackageJson))

    switch (userOptions.client) {
      case 'react':
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        ;(packagejson.scripts as any)['client'] = `PORT=3000 yarn --cwd=../client dev`
    }

    if (!userOptions.backgroundWorkers) {
      removeDependency(packagejson, '@rvohealth/psychic-workers')
      removeDependency(packagejson, 'bullmq')
      removeDependency(packagejson, '@bull-board/express')
    }

    if (!userOptions.ws) {
      removeDependency(packagejson, '@rvohealth/psychic-websockets')
      removeDependency(packagejson, '@socket.io/redis-adapter')
      removeDependency(packagejson, '@socket.io/redis-emitter')
      removeDependency(packagejson, 'socket.io')
      removeDependency(packagejson, 'socket.io-adapter')
    }

    if (!userOptions.ws && !userOptions.backgroundWorkers) {
      removeDependency(packagejson, 'ioredis')
    }

    return JSON.stringify(packagejson, null, 2)
  }
}

function removeDependency(packageJson: any, key: string) {
  delete packageJson.dependencies[key]
}
