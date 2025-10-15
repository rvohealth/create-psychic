import '@conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic'

export async function setup() {
  await PsychicDevtools.launchDevServer('clientFspecApp', { port: 3000, cmd: 'yarn client:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('clientFspecApp')
}
