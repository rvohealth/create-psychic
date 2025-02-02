import { PsychicApplication, PsychicApplicationInitOptions } from '@rvohealth/psychic'
import { PsychicApplicationWebsockets } from '@rvohealth/psychic-websockets'
import psychicConf from '../../conf/app'
import dreamConf from '../../conf/dream'
import wsConf from '../../conf/websockets'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)
  await PsychicApplicationWebsockets.init(psychicApp, wsConf)
  return psychicApp
}
