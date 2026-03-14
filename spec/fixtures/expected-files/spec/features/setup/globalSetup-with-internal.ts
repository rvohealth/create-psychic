import '@conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/system'

export async function setup() {
  await PsychicDevtools.launchDevServer('internalFspecApp', { port: 3052, cmd: 'yarn internal:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('internalFspecApp')
}
