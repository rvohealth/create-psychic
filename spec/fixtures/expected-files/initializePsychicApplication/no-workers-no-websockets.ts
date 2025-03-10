import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'
import psychicConf from './app'
import dreamConf from './dream'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
