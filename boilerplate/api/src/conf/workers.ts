import { PsychicApplicationWorkers } from '@rvoh/psychic-workers'
import { Queue, Worker } from 'bullmq'
import { Cluster, Redis } from 'ioredis'
import * as os from 'os'
import AppEnv from './AppEnv.js'

export default (workersApp: PsychicApplicationWorkers) => {
  workersApp.set('background', {
    defaultWorkstream: {
      // https://docs.bullmq.io/guide/parallelism-and-concurrency
      workerCount: os.cpus().length,
      concurrency: 100,
    },

    namedWorkstreams: [
      {
        name: 'NamedWorkstream',
        workerCount: 1,
      },

      // Rate limited workstream (requires BullMQ Pro)
      // {
      //   name: 'RateLimitedWorkstream',
      //   // https://docs.bullmq.io/guide/parallelism-and-concurrency
      //   workerCount: 1,
      //   concurrency: 100,
      //   rateLimit: {
      //     max: 100,
      //     duration: 1000,
      //   },
      // },
    ],

    providers: {
      Queue,
      Worker,
    },

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

    // Any instance can push onto the queue
    defaultQueueConnection: AppEnv.isProduction
      ? new Cluster(
          [
            {
              host: AppEnv.string('BG_JOBS_REDIS_HOST'),
              port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || 6379,
            },
          ],
          {
            slotsRefreshTimeout: 5000,
            dnsLookup: (address, callback) => callback(null, address),
            redisOptions: {
              username: AppEnv.string('BG_JOBS_REDIS_USERNAME'),
              password: AppEnv.string('BG_JOBS_REDIS_PASSWORD'),
              tls: {},
            },
            enableOfflineQueue: false,
          }
        )
      : new Redis({
          host: AppEnv.string('BG_JOBS_REDIS_HOST', { optional: true }) || 'localhost',
          port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || 6379,
          username: AppEnv.string('BG_JOBS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('BG_JOBS_REDIS_PASSWORD', { optional: true }),
          // tls:  {},
          enableOfflineQueue: false,
        }),

    // Only establish the worker Redis connection if on an instance that does the work
    defaultWorkerConnection: AppEnv.boolean('WORKER_SERVICE')
      ? undefined
      : AppEnv.isProduction
      ? new Cluster(
          [
            {
              host: AppEnv.string('BG_JOBS_REDIS_HOST'),
              port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || 6379,
            },
          ],
          {
            slotsRefreshTimeout: 5000,
            dnsLookup: (address, callback) => callback(null, address),
            redisOptions: {
              username: AppEnv.string('BG_JOBS_REDIS_USERNAME'),
              password: AppEnv.string('BG_JOBS_REDIS_PASSWORD'),
              tls: {},
              maxRetriesPerRequest: null,
            },
          }
        )
      : new Redis({
          host: AppEnv.string('BG_JOBS_REDIS_HOST', { optional: true }) || 'localhost',
          port: AppEnv.integer('BG_JOBS_REDIS_PORT', { optional: true }) || 6379,
          username: AppEnv.string('BG_JOBS_REDIS_USERNAME', { optional: true }),
          password: AppEnv.string('BG_JOBS_REDIS_PASSWORD', { optional: true }),
          // tls:  {},
          maxRetriesPerRequest: null,
        }),
  })

  // ******
  // HOOKS:
  // ******

  workersApp.on('workers:shutdown', () => {
    // add worker shutdown sequence here
  })
}
