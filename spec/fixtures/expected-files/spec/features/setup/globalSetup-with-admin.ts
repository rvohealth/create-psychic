import '@conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/system'

export async function setup() {
  await PsychicDevtools.launchDevServer('adminFspecApp', { port: 3051, cmd: 'yarn admin:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('adminFspecApp')
}
