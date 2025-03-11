import { PsychicApplication, PsychicApplicationInitOptions } from '@rvoh/psychic'
import { PsychicApplicationWebsockets } from '@rvoh/psychic-websockets'
import psychicConf from './app'
import dreamConf from './dream'
import wsConf from './websockets'

export default async function initializePsychicApplication(opts: PsychicApplicationInitOptions = {}) {
  const psychicApp = await PsychicApplication.init(psychicConf, dreamConf, opts)
  await PsychicApplicationWebsockets.init(psychicApp, wsConf)
  return psychicApp
}
