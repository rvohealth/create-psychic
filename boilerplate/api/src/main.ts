import './conf/loadEnv'
import { PsychicServer } from '@rvohealth/psychic'

async function start() {
  const server = new PsychicServer()
  await server.start()

  process.on('SIGINT', async () => {
    await server.stop()
  })
}

start()
