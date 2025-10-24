import '@conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/internal'

export async function setup() {
  await PsychicDevtools.launchDevServer('adminFspecApp', { port: 3001, cmd: 'yarn admin:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('adminFspecApp')
}
