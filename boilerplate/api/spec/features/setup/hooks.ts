import '@rvohealth/psychic-spec-helpers'
import '../../../src/conf/global'

import { DreamApplication } from '@rvohealth/dream'
import { PsychicServer } from '@rvohealth/psychic'
import { truncate } from '@rvohealth/dream-spec-helpers'
import initializePsychicApplication from '../../../src/conf/initializePsychicApplication'

jest.setTimeout(
  (process.env.JEST_FEATURE_TIMEOUT_SECONDS && parseInt(process.env.JEST_FEATURE_TIMEOUT_SECONDS) * 1000) ||
    25000
)

let server: PsychicServer

beforeEach(async () => {
  try {
    await initializePsychicApplication()
  } catch (err) {
    console.error(err)
    throw err
  }

  server = new PsychicServer()
  await server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))

  await truncate(DreamApplication)
}, 50000)

afterEach(async () => {
  await server.stop({ bypassClosingDbConnections: true })
})
