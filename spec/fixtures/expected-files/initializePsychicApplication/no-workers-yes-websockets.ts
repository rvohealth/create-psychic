import { PsychicApplication } from '@rvohealth/psychic'
import { PsychicApplicationWebsockets } from '@rvohealth/psychic-websockets'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'
import wsConf from '../../conf/websockets'

export default async function initializePsychicApplication() {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf)
  await PsychicApplicationWebsockets.init(psychicApp, wsConf)
  return psychicApp
}
