import '@conf/loadEnv.js'

import AppEnv from '@conf/AppEnv.js'
import initializeDreamApp from '@conf/system/initializeDreamApp.js'
import { DreamCLI } from '@rvoh/dream/system'
import * as repl from 'node:repl'

const replServer = repl.start('> ')

export default (async function () {
  await initializeDreamApp()

  replServer.context.AppEnv = AppEnv

  await DreamCLI.loadRepl(replServer.context)
})()
