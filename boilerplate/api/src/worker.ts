import './conf/global'
import { closeAllDbConnections } from '@rvohealth/dream'
import { background, stopBackgroundWorkers } from '@rvohealth/psychic'

async function startBackgroundWorkers() {
  // uncomment if using redis, and you desire to connect to the provided background job system
  // await background.connect()
  // background.queueEvents.on('failed', handleBullError)

  process.on('SIGINT', async () => {
    // uncomment if using redis, and you desire to connect to the provided background job system
    // await stopBackgroundWorkers()
    await closeAllDbConnections()
  })
}

function handleBullError(err: any) {
  // custom error handling here
  throw err
}

startBackgroundWorkers()
