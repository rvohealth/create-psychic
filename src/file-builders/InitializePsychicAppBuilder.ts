import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp'

export default class InitializePsychicAppBuilder {
  public static async build(options: InitPsychicAppCliOptions) {
    if (!options.websockets && !options.workers) {
      return `\
import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
`
    }

    const workersImport = options.workers
      ? "\nimport { PsychicApplicationWorkers } from '@rvohealth/psychic-workers'"
      : ''
    const wsImport = options.websockets
      ? "\nimport { PsychicApplicationWebsockets } from '@rvohealth/psychic-websockets'"
      : ''

    const workersConfImport = options.workers ? "\nimport workersConf from '../../conf/workers'" : ''
    const wsConfImport = options.websockets ? "\nimport wsConf from '../../conf/websockets'" : ''

    const workersInit = options.workers
      ? '\n  await PsychicApplicationWorkers.init(psychicApp, workersConf)'
      : ''
    const wsInit = options.websockets ? '\n  await PsychicApplicationWebsockets.init(psychicApp, wsConf)' : ''

    return `\
import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'${wsImport}${workersImport}
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'${wsConfImport}${workersConfImport}

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)${wsInit}${workersInit}
  return psychicApp
}
`
  }
}
