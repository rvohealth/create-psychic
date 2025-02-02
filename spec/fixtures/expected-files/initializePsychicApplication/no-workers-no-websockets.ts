import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  return await PsychicApplication.init(psychicConf, dreamConf, opts)
}
