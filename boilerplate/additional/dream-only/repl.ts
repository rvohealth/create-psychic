import '@conf/loadEnv.js'

import AppEnv from '@conf/AppEnv.js'
import initializeDreamApp from '@conf/system/initializeDreamApp.js'
import { loadRepl } from '@rvoh/dream'
import * as repl from 'node:repl'

const replServer = repl.start('> ')

export default (async function () {
  await initializeDreamApp()

  replServer.context.AppEnv = AppEnv

  await loadRepl(replServer.context)
})()
