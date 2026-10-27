import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

// Writes spec/features/setup/hooks.ts. An app with websockets starts its websocket
// server there, beside the api server; an app without them has no
// @rvoh/psychic-websockets (PackagejsonBuilder removes it), so its hooks never
// mention one.
export default class FeatureSpecHooksBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'spec', 'features', 'setup', 'hooks.ts'))
    ).toString()

    return contents
      .replace('<WEBSOCKETS_IMPORTS>', websocketsImports(options))
      .replace('<WEBSOCKETS_DECLARATION>', websocketsDeclaration(options))
      .replace('<WEBSOCKETS_START>', websocketsStart(options))
      .replace('<STOP_SERVERS>', stopServers(options))
  }
}

function websocketsImports(options: NewPsychicAppCliOptions) {
  if (!options.websockets) return ''

  return `
import { Cable } from '@rvoh/psychic-websockets'
import AppEnv from '#conf/AppEnv.js'`
}

function websocketsDeclaration(options: NewPsychicAppCliOptions) {
  if (!options.websockets) return ''

  return `
let cable: Cable`
}

function websocketsStart(options: NewPsychicAppCliOptions) {
  if (!options.websockets) return ''

  return `

  /*
   * start websocket server
   *
   * the websocket server starts here, in the spec worker beside the api
   * server, and never as a separate process (such as a server launched from
   * globalSetup.ts), for two reasons:
   *   - Dream gives each spec worker its own test database, so a separate
   *     process can read a different one and miss the rows a spec creates
   *   - in test, websockets use the in-process adapter (see
   *     conf/initializers/websockets.ts), so a separate process never
   *     receives a Ws.emit made in the spec worker
   *
   * it listens on WS_PORT, else on 8889, the port src/ws.ts uses under test
   * (ws:dev uses 8888). A WS_PORT exported in your shell reaches both, so
   * while a ws:dev started from that shell runs, this server cannot start.
   */
  cable = new Cable()
  await cable.start(AppEnv.integer('WS_PORT', { optional: true }) || 8889)`
}

function stopServers(options: NewPsychicAppCliOptions) {
  if (!options.websockets) return '  await server.stop()'

  return `\
  // the websocket server stops first, so a failing server.stop() cannot leave
  // its fixed port taken when the next spec file starts one, and server.stop()
  // runs even if cable.stop() throws, so the api server's port is freed too
  try {
    await cable?.stop()
  } finally {
    await server.stop()
  }`
}
