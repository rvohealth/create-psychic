import './loadEnv.js'

import { loadRepl } from '@rvoh/dream'
import * as repl from 'node:repl'
import AppEnv from './AppEnv.js'
import initializeDreamApp from './system/initializeDreamApp.js'

const replServer = repl.start('> ')

export default (async function () {
  await initializeDreamApp()

  replServer.context.AppEnv = AppEnv

  await loadRepl(replServer.context)
})()
