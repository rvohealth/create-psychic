import './loadEnv.js'

import { loadRepl } from '@rvoh/dream'
import * as repl from 'node:repl'
import AppEnv from './AppEnv.js'
import initializePsychicApplication from './system/initializePsychicApplication.js'

const replServer = repl.start('> ')

export default (async function () {
  await initializePsychicApplication()

  replServer.context.AppEnv = AppEnv

  await loadRepl(replServer.context)
})()
