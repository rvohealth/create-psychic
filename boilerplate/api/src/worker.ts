import './conf/global'
import { closeAllDbConnections } from '@rvohealth/dream'
import { background, stopBackgroundWorkers } from '@rvohealth/psychic'

async function startBackgroundWorkers() {
  await background.connect()
  background.queueEvents.on('failed', handleBullError)

  process.on('SIGINT', async () => {
    await stopBackgroundWorkers()
    await closeAllDbConnections()
  })
}

function handleBullError(err: any) {
  // custom error handling here
  throw err
}

startBackgroundWorkers()
