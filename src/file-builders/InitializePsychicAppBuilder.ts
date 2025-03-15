import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

export default class InitializePsychicAppBuilder {
  public static async build(options: InitPsychicAppCliOptions) {
    if (!options.websockets && !options.workers) {
      return `\
import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'
import psychicConf from './app.js'
import dreamConf from './dream.js'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
`
    }

    const workersImport = options.workers
      ? "\nimport { PsychicApplicationWorkers } from '@rvoh/psychic-workers'"
      : ''
    const wsImport = options.websockets
      ? "\nimport { PsychicApplicationWebsockets } from '@rvoh/psychic-websockets'"
      : ''

    const workersConfImport = options.workers ? "\nimport workersConf from './workers.js'" : ''
    const wsConfImport = options.websockets ? "\nimport wsConf from './websockets.js'" : ''

    const workersInit = options.workers
      ? '\n  await PsychicApplicationWorkers.init(psychicApp, workersConf)'
      : ''
    const wsInit = options.websockets ? '\n  await PsychicApplicationWebsockets.init(psychicApp, wsConf)' : ''

    return `\
import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'${wsImport}${workersImport}
import psychicConf from './app.js'
import dreamConf from './dream.js'${wsConfImport}${workersConfImport}

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)${wsInit}${workersInit}
  return psychicApp
}
`
  }
}
