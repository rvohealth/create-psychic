import '@conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/system'

export async function setup() {
  await PsychicDevtools.launchDevServer('clientFspecApp', { port: 3000, cmd: 'yarn client:fspec' })
  await PsychicDevtools.launchDevServer('internalFspecApp', { port: 3002, cmd: 'yarn internal:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('clientFspecApp')
  PsychicDevtools.stopDevServer('internalFspecApp')
}
