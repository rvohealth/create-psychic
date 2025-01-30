import { PsychicApplication } from '@rvohealth/psychic'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'

export default async function initializePsychicApplication() {
  return await PsychicApplication.init(psychicConf, dreamConf)
}
