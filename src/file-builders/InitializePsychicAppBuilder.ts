import { NewAppCLIOptions } from '../helpers/gatherUserInput'

export default class InitializePsychicAppBuilder {
  public static async build(userOptions: NewAppCLIOptions) {
    if (!userOptions.ws && !userOptions.backgroundWorkers) {
      return `\
import { PsychicApplication } from '@rvohealth/psychic'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'

export default async function initializePsychicApplication() {
  return await PsychicApplication.init(psychicConf, dreamConf)
}
`
    }

    const workersImport = userOptions.backgroundWorkers
      ? "\nimport { PsychicApplicationWorkers } from '@rvohealth/psychic-workers'"
      : ''
    const wsImport = userOptions.ws
      ? "\nimport { PsychicApplicationWebsockets } from '@rvohealth/psychic-websockets'"
      : ''

    const workersConfImport = userOptions.backgroundWorkers
      ? "\nimport workersConf from '../../conf/workers'"
      : ''
    const wsConfImport = userOptions.ws ? "\nimport wsConf from '../../conf/websockets'" : ''

    const workersInit = userOptions.backgroundWorkers
      ? '\n  await PsychicApplicationWorkers.init(psychicApp, workersConf)'
      : ''
    const wsInit = userOptions.ws ? '\n  await PsychicApplicationWebsockets.init(psychicApp, wsConf)' : ''

    return `\
import { PsychicApplication } from '@rvohealth/psychic'${workersImport}${wsImport}
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'${workersConfImport}${wsConfImport}

export default async function initializePsychicApplication() {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf)${workersInit}${wsInit}
  return psychicApp
}
`
  }
}
