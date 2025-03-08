import '../../../src/conf/loadEnv'

import initializePsychicApplication from '../../../src/conf/initializePsychicApplication'
import { startDevServer, stopDevServer } from './startDevServer'

export async function setup() {
  await initializePsychicApplication()
  await startDevServer()
}

export function teardown() {
  stopDevServer()
}
