import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'
import { PsychicApplicationWorkers } from '@rvoh/psychic-workers'
import psychicConf from './app'
import dreamConf from './dream'
import workersConf from './workers'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)
  await PsychicApplicationWorkers.init(psychicApp, workersConf)
  return psychicApp
}
