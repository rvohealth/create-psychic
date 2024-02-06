import { PsychicConfig } from '@rvohealth/psychic'
import { Application } from 'express'
import audit from 'express-requests-logger'
import { loggerOptions } from '../logs'
import increaseNodeStackTraceLimits from '../../helpers/increaseNodeStackTraceLimits'
import { testEnv } from '../../helpers/environment'

export default async (psyConf: PsychicConfig) => {
  increaseNodeStackTraceLimits()

  initializeLogger(psyConf.app)
}

function initializeLogger(app: Application) {
  if (!testEnv() || process.env.REQUEST_LOGGING === '1') {
    app.use(audit(loggerOptions()))
  }
}
