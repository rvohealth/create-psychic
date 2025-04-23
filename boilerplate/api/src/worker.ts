import './conf/global.js'

import { PsychicApplication } from '@rvoh/psychic'
import { background } from '@rvoh/psychic-workers'
import increaseNodeStackTraceLimits from './conf/system/increaseNodeStackTraceLimits.js'
import initializePsychicApplication from './conf/system/initializePsychicApplication.js'

increaseNodeStackTraceLimits()

async function startBackgroundWorkers() {
  await initializePsychicApplication()

  PsychicApplication.log('STARTING WORKERS...')

  background.work()

  background.workers.forEach(worker => {
    worker.on('failed', (job, error) => {
      handleBullJobFailed(job?.id, error.message)
        .then(() => {})
        .catch(() => {})
    })
  })

  PsychicApplication.log('FINISHED STARTING WORKERS')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleBullJobFailed(jobId: string | undefined, failedReason: string) {
  // handle your job error here
  // const job = (await background.queue!.getJob(jobId)) || 'Job not found'
}

void startBackgroundWorkers()
