import '#conf/loadEnv.js'

import { PsychicDevtools } from '@rvoh/psychic/system'

export async function setup() {
  // Start only servers that never touch the database here, such as a client app's
  // dev server. A server started here runs as a separate process, outside the spec
  // worker: Dream gives each spec worker its own test database, so that process can
  // read a different one and miss the rows a spec creates; and in test, websockets
  // use the in-process adapter, so it never receives a Ws.emit made in the spec
  // worker. The api server, and in an app with websockets the websocket server,
  // start in hooks.ts instead.
  await PsychicDevtools.launchDevServer('internalFspecApp', { port: 3052, cmd: 'yarn internal:fspec' })
}

export function teardown() {
  PsychicDevtools.stopDevServer('internalFspecApp')
}
