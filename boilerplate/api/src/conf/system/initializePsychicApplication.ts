import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'
import psychicConf from '../app.js'
import dreamConf from '../dream.js'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
