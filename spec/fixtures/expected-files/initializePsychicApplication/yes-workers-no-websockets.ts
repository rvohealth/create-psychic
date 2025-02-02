import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'
import { PsychicApplicationWorkers } from '@rvohealth/psychic-workers'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'
import workersConf from '../../conf/workers'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)
  await PsychicApplicationWorkers.init(psychicApp, workersConf)
  return psychicApp
}
