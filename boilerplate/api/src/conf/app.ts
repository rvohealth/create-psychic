import { PsychicConfig, background } from '@rvohealth/psychic'
import { developmentOrTestEnv, testEnv } from '@rvohealth/dream'
import audit from 'express-requests-logger'

export default (psy: PsychicConfig) => {
  // ******
  // CONFIG:
  // ******

  // the name of your application (no spaces)
  psy.appName = '<APP_NAME>'

  // set to true to leverage internal websocket bindings to socket.io
  psy.useWs = <USE_WS>

  // set to true to leverage internal redis bindings.
  psy.useRedis = <USE_REDIS>

  // set to true if you want to also attach a client app to your project.
  psy.apiOnly = <API_ONLY>

  // set options to pass to express.json when middleware is booted
  psy.setJsonOptions({
    limit: '20kb',
  })

  // set options to pass to coors when middleware is booted
  psy.setCorsOptions({
    credentials: true,
    origin: [
      process.env.CLIENT_HOST ||
        (process.env.NODE_ENV === 'test' ? 'http://localhost:7778' : 'http://localhost:3000'),
    ],
  })

  // configuration options for bullmq queue (used for running background jobs in redis)
  psy.setBackgroundQueueOptions({
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 20000,
      // 524,288,000 ms (~6.1 days) using algorithm:
      // "2 ^ (attempts - 1) * delay"
      attempts: 20,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  })

  // configuration options for bullmq worker (used for running background jobs in redis)
  psy.setBackgroundWorkerOptions({})

  // redis background job credentials
  psy.setRedisBackgroundJobCredentials({
    username: process.env.BACKGROUND_JOBS_REDIS_USER,
    password: process.env.BACKGROUND_JOBS_REDIS_PASSWORD,
    host: process.env.BACKGROUND_JOBS_REDIS_HOST,
    port: process.env.BACKGROUND_JOBS_REDIS_PORT,
    secure: process.env.BACKGROUND_JOBS_REDIS_USE_SSL === '1',
  })

  // redis websocket credentials
  psy.setRedisWsCredentials({
    username: process.env.WS_REDIS_USER,
    password: process.env.WS_REDIS_PASSWORD,
    host: process.env.WS_REDIS_HOST,
    port: process.env.WS_REDIS_PORT,
    secure: process.env.WS_REDIS_USE_SSL === '1',
  })

  // ******
  // HOOKS:
  // ******

  // run a callback on server boot (but before routes are processed)
  psy.on('boot', () => {
    if (!testEnv() || process.env.REQUEST_LOGGING === '1') {
      const SENSITIVE_FIELDS = ['password', 'token', 'authentication', 'authorization', 'secret']
      const defaultRequestFilter = {
        maskBody: SENSITIVE_FIELDS,
        maskQuery: SENSITIVE_FIELDS,
        maskHeaders: SENSITIVE_FIELDS,
        maxBodyLength: 500,
      }


      psy.app.use(audit({
        request: {
          ...defaultRequestFilter,
          excludeHeaders: [
            'authorization',
            'content-length',
            'connection',
            'cookie',
            'sec-ch-ua',
            'sec-ch-ua-mobile',
            'sec-ch-ua-platform',
            'sec-fetch-dest',
            'sec-fetch-mode',
            'sec-fetch-site',
            'user-agent',
          ],
        },
        response: {
          ...defaultRequestFilter,
          excludeHeaders: ['*'], // Exclude all headers from responses,
          excludeBody: ['*'], // Exclude all body from responses
        },
        excludeURLs: ['/health_check'],
      }))
    }
  })

  // run a callback after routes are done processing
  psy.on('after:routes', () => {})

  // run a callback after the config is loaded
  psy.on('load', () => {
    // uncomment to initialize background jobs
    // (this should only be done if useRedis is true)
    <BACKGROUND_CONNECT>
  })

  // run a callback after the config is loaded, but only if NODE_ENV=development
  psy.on('load:dev', () => {})

  // run a callback after the config is loaded, but only if NODE_ENV=test
  psy.on('load:test', () => {})

  // run a callback after the config is loaded, but only if NODE_ENV=prod
  psy.on('load:prod', () => {})

  // this function will be run any time a server error is encountered
  // that psychic isn't sure how to respond to (i.e. 500 internal server errors)
  psy.on('server_error', (err, _, res) => {
    if (!res.headersSent) res.sendStatus(500)
    else if (developmentOrTestEnv()) throw err
  })

  // run a callback after the websocket server is initially started
  psy.on('ws:start', () => {})

  // run a callback after connection to the websocket service
  psy.on('ws:connect', () => {})
}
