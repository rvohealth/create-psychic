import { PsychicServer } from '@rvoh/psychic'
import initializePsychicApp from './api/conf/system/initializePsychicApp.js'

export default async function nodeInstrumentation() {
  await initializePsychicApp()

  const server = new PsychicServer()
  await server.start(parseInt(process.env.PSYCHIC_PORT || '7777'))
}
