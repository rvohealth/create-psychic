import './conf/global.js'

import { PsychicServer } from '@rvoh/psychic'
import initializePsychicApplication from './conf/system/initializePsychicApplication.js'

async function start() {
  await initializePsychicApplication()

  const server = new PsychicServer()
  await server.start()
}

void start()
