import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'
import psychicConf from './app'
import dreamConf from './dream'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
