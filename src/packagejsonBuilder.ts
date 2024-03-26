import { NewAppCLIOptions } from './gatherUserInput.js'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default class PackagejsonBuilder {
  public static async buildAPI(userOptions: NewAppCLIOptions) {
    const packagejson = require('../boilerplate/api/package.json')

    if (userOptions.apiOnly) return JSON.stringify(packagejson, null, 2)

    switch (userOptions.client) {
      case 'react':
        ;(packagejson.scripts as any)['client'] = `PORT=3000 yarn --cwd=../client dev`
    }

    return JSON.stringify(packagejson, null, 2)
  }
}
