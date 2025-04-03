import '../../../src/conf/loadEnv.js'

import { PsychicBin } from '@rvoh/psychic'
import initializePsychicApplication from '../../../src/conf/system/initializePsychicApplication.js'

export async function setup() {
  await initializePsychicApplication()
  await PsychicBin.syncOpenapiJson()
}

export async function teardown() {
  // your custom teardown...
}
