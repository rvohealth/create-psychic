import '../../../src/conf/loadEnv.js'

import { launchDevServer, stopDevServers } from '@rvoh/psychic-spec-helpers'

export async function setup() {
  await launchDevServer('admin', { port: 3000, cmd: 'yarn client:fspec' })
}

export function teardown() {
  stopDevServers()
}
