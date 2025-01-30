import { PsychicApplication } from '@rvohealth/psychic'
import { PsychicApplicationWorkers } from '@rvohealth/psychic-workers'
import { PsychicApplicationWebsockets } from '@rvohealth/psychic-websockets'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'
import workersConf from '../../conf/workers'
import wsConf from '../../conf/websockets'

export default async function initializePsychicApplication() {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf)
  await PsychicApplicationWorkers.init(psychicApp, workersConf)
  await PsychicApplicationWebsockets.init(psychicApp, wsConf)
  return psychicApp
}
