import os from 'os'
import path from 'path'
import { PsychicApplication, background } from '@rvohealth/psychic'
import Redis, { Cluster } from 'ioredis'
import AppEnv from '../app/helpers/AppEnv'
import expressWinston from 'express-winston'
import inflections from './inflections'
import routesCb from './routes'
import winston from 'winston'


export default async (psy: PsychicApplication) => {
  await psy.load('controllers', path.join(__dirname, '..', 'app', 'controllers'))

  psy.set('appName', '<APP_NAME>')
  psy.set('useWs', <USE_WS>)
  psy.set('useRedis', <USE_REDIS>)
  psy.set('apiOnly', <API_ONLY>)
  psy.set('encryption', {
    cookies: {
      current: {
        algorithm: 'aes-256-gcm',
        key: AppEnv.string('APP_ENCRYPTION_KEY'),
      },
    },
  })

  psy.set('apiRoot', path.join(__dirname, '..', '..'))
  psy.set('clientRoot', path.join(__dirname, '..', '..', '..', 'client'))
  psy.set('inflections', inflections)
  psy.set('routes', routesCb)

  psy.set('json', {
    limit: '20kb',
  })

  // Encryption between the load balancer and your Psychic webservers
  // is an important part of encryption-in-transit. This SSL
  // certificate will be a self-signed certificate. It is separate
  // from the SSL certificate that you'll install on your load balancer.
  if (AppEnv.isProduction) {
    psy.set('ssl', {
      key: AppEnv.string('SSL_KEY_PATH'),
      cert: AppEnv.string('SSL_CERT_PATH'),
    })
  }

  psy.set('cors', {
    credentials: true,
    origin: [
      AppEnv.string('CLIENT_HOST', { optional: true }) || 'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })

  psy.set('cookie', {
    maxAge: {
      days: 14,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    },
  })

  psy.set('background', {
    defaultWorkstream: {
      // https://docs.bullmq.io/guide/parallelism-and-concurrency
      workerCount: os.cpus().length,
      concurrency: 100,
    },

    namedWorkstreams: [
    ],

    defaultBullMQQueueOptions: {
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
    },

    defaultQueueConnection: AppEnv.isProduction
      ? new Cluster(
          [
            {
              host: AppEnv.string('BG_JOBS_REDIS_HOST'),
              port: AppEnv.integer('BG_JOBS_REDIS_PORT')
            },
          ],
          {
            dnsLookup: (address, callback) => callback(null, address),
            redisOptions: {
              username: AppEnv.string('BG_JOBS_REDIS_USERNAME'),
              password: AppEnv.string('BG_JOBS_REDIS_PASSWORD'),
              tls: AppEnv.isProduction ? {} : undefined,
            },
            enableOfflineQueue: false,
          }
        )
      : new Redis({
          host: AppEnv.string('BG_JOBS_REDIS_HOST', { optional: true }) || 'localhost',
          port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || '6379',
          username: AppEnv.string('BG_JOBS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('BG_JOBS_REDIS_PASSWORD', { optional: true }),
          tls: AppEnv.isProduction ? {} : undefined,
          enableOfflineQueue: false,
        }),

    defaultWorkerConnection: !process.env.WORKER_SERVICE
      ? undefined
      : AppEnv.isProduction
        ? new Cluster(
            [
              {
                host: AppEnv.string('BG_JOBS_REDIS_HOST'),
                port: AppEnv.integer('BG_JOBS_REDIS_PORT'),
              },
            ],
            {
              dnsLookup: (address, callback) => callback(null, address),
              redisOptions: {
                username: AppEnv.string('BG_JOBS_REDIS_USERNAME'),
                password: AppEnv.string('BG_JOBS_REDIS_PASSWORD'),
                tls: AppEnv.isProduction ? {} : undefined,
                maxRetriesPerRequest: null,
              },
            }
          )
        : new Redis({
            host: AppEnv.string('BG_JOBS_REDIS_HOST', { optional: true }) || 'localhost',
            port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || '6379',
            username: AppEnv.string('BG_JOBS_REDIS_USERNAME', { optional: true }),
            password: AppEnv.string('BG_JOBS_REDIS_PASSWORD', { optional: true }),
            tls: AppEnv.isProduction ? {} : undefined,
            maxRetriesPerRequest: null,
          }),
  })

  psy.set('websockets', {
    connection: AppEnv.isProduction
      ? new Redis({
          host: AppEnv.string('WS_REDIS_HOST'),
          port: AppEnv.integer('WS_REDIS_PORT'),
          username: AppEnv.string('WS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('WS_REDIS_PASSWORD', { optional: true }),
          tls: AppEnv.isProduction ? {} : undefined,
          maxRetriesPerRequest: null,
        })
      : new Redis({
          host: AppEnv.string('WS_REDIS_HOST', { optional: true }) || 'localhost',
          port: AppEnv.integer('WS_REDIS_PORT', { optional: true }) || '6379',
          username: AppEnv.string('WS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('WS_REDIS_PASSWORD', { optional: true }),
          tls: AppEnv.isProduction ? {} : undefined,
          maxRetriesPerRequest: null,
        }),
  })

  psy.set('openapi', {
    defaults: {
      components: {
        schemas: {},
      },
    },
  })

  // run a callback when the express server starts. the express app will be passed to each callback as the first argument
  psy.on('server:init', psychicServer => {
    const app = psychicServer.expressApp

    if (!AppEnv.isTest || AppEnv.boolean('REQUEST_LOGGING')) {
      const SENSITIVE_FIELDS = ['password', 'token', 'authentication', 'authorization', 'secret']

      app.use(
        expressWinston.logger({
          transports: [new winston.transports.Console()],
          format: winston.format.combine(winston.format.colorize(), winston.format.json()),
          meta: true, // optional: control whether you want to log the meta data about the request (default to true)
          msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
          expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
          colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
          headerBlacklist: [
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
          ignoredRoutes: ['/health_check'],
          bodyBlacklist: SENSITIVE_FIELDS,
        }),
      )
    }
  })

  psy.on('server:shutdown', () => {
    // run custom code when server is shutdown
  })

  psy.on('worker:shutdown', () => {
    // run custom code when background workers are shut down
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

  // run a callback after the config is loaded, but only if NODE_ENV=production
  psy.on('load:prod', () => {})

  // this function will be run any time a server error is encountered
  // that psychic isn't sure how to respond to (i.e. 500 internal server errors)
  psy.on('server:error', (err, _, res) => {
    if (!res.headersSent) res.sendStatus(500)
    else if (AppEnv.isDevelopmentOrTest) throw err
  })

  // run a callback after the websocket server is initially started
  psy.on('ws:start', () => {})

  // run a callback after connection to the websocket service
  psy.on('ws:connect', () => {})
}
