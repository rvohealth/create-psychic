import { DreamApp } from '@rvoh/dream'

import AppEnv from '@conf/AppEnv.js'
import inflections from '@conf/inflections.js'
import importAll from '@conf/system/importAll.js'
import importDefault from '@conf/system/importDefault.js'
import srcPath from '@conf/system/srcPath.js'
import { debuglog } from 'node:util'

// Enable debug logging with NODE_DEBUG=sql
const debugSql = debuglog('sql').enabled

export default async (app: DreamApp) => {
  app.set('projectRoot', srcPath('..'))
  app.set('primaryKeyType', 'bigserial')
  app.set('inflections', inflections)

  await app.load('models', srcPath('..', 'src', 'api', 'app', 'models'), path => importDefault(path))
  await app.load('serializers', srcPath('..', 'src', 'api', 'app', 'serializers'), path => importAll(path))

  // provides a list of path overrides for your app. This is optional, and will default
  // to the paths expected for a typical psychic application.
  app.set('paths', {
    conf: 'src/api/conf',
    db: 'src/api/db',
    types: 'src/types',
    factories: 'spec/factories',
    models: 'src/api/app/models',
    modelSpecs: 'spec/unit/models',
    serializers: 'src/api/app/serializers',
  })

  app.set('parallelTests', AppEnv.integer('DREAM_PARALLEL_TESTS', { optional: true }) || 1)

  app.set('db', {
    primary: {
      user: AppEnv.string('DB_USER'),
      password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
      host: AppEnv.string('DB_HOST'),
      name: AppEnv.string('DB_NAME'),
      port: AppEnv.integer('DB_PORT'),
      // only connect to replica db insecurely if `DB_NO_SSL` is explicitly set
      useSsl: !AppEnv.boolean('DB_NO_SSL'),
    },
    replica: AppEnv.string('REPLICA_DB_HOST', { optional: true })
      ? {
          user: AppEnv.string('DB_USER'),
          password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
          host: AppEnv.string('REPLICA_DB_HOST'),
          name: AppEnv.string('DB_NAME'),
          port: AppEnv.integer('REPLICA_DB_PORT', { optional: true }) || AppEnv.integer('DB_PORT'),
          // only connect to replica db insecurely if `DB_NO_SSL` is explicitly set
          useSsl: !AppEnv.boolean('DB_NO_SSL'),
        }
      : undefined,
  })

  app.on('db:log', event => {
    if (!debugSql) return

    if (event.level === 'error') {
      DreamApp.logWithLevel('error', 'the following db query encountered an unexpected error: ', {
        durationMs: event.queryDurationMillis,
        error: event.error,
        sql: event.query.sql,
        params: event.query.parameters.map(maskPII),
      })
    } else {
      DreamApp.log('db query completed:', {
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
        params: event.query.parameters.map(maskPII),
      })
    }
  })
}

function maskPII(data: unknown) {
  return data
}