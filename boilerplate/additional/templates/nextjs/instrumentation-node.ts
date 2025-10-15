import initializePsychicApp from '@conf/system/initializePsychicApp.js'
import { PsychicServer } from '@rvoh/psychic'

export default async function nodeInstrumentation() {
  await initializePsychicApp()

  const server = new PsychicServer()
  await server.start(parseInt(process.env.PSYCHIC_PORT || '7777'))
}
