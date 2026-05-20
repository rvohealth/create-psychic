import { DreamApp, type SingleDbCredential } from '@rvoh/dream'

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
  app.set('packageManager', 'npm')
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

  // Verified TLS to Postgres via Node's system CA store. Works out of the box
  // with managed providers that present a public-CA-signed certificate
  // (Supabase, Neon, Render, Azure Database for PostgreSQL Flexible Server).
  //
  // If your provider uses a private CA, add its bundle:
  //   - AWS RDS:       `ssl: { rejectUnauthorized: true, ca: readFileSync('rds-ca.pem') }`
  //                    https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html
  //   - GCP Cloud SQL: `ssl: { rejectUnauthorized: true, ca: readFileSync('server-ca.pem') }`
  //                    https://cloud.google.com/sql/docs/postgres/connect-overview#secure
  //
  // For providers that present a self-signed certificate (Heroku Hobby tier
  // and some local Docker images), drop verification:
  //   `ssl: { rejectUnauthorized: false }` — encrypted but unauthenticated.
  //
  // Set `DB_NO_SSL=true` to disable TLS entirely (local dev only).
  const dbSsl: { rejectUnauthorized: true } | false = AppEnv.boolean('DB_NO_SSL')
    ? false
    : { rejectUnauthorized: true }

  // Connection-pool defaults. node-postgres ships unprotective defaults, so
  // these are set explicitly here (the @rvoh/dream library stays backward
  // compatible by NOT defaulting them; new apps get sensible values):
  //
  //  - connectionTimeoutMillis: pg default 0 = a `pool.connect()` waits
  //    FOREVER when the pool is exhausted, so a connection leak or stalled
  //    DB hangs the process instead of failing fast. Bounded here
  //    (override via DB_CONNECTION_TIMEOUT_MS).
  //  - application_name: pg default empty = connections are anonymous in
  //    `pg_stat_activity` / server logs. Naming them makes incident
  //    response (and "who is holding this connection?") tractable.
  //  - keepAlive: pg default false. Enable TCP keepalive so dead
  //    connections behind a load balancer / NAT are detected instead of
  //    hanging.
  //
  // `statement_timeout` / `query_timeout` / `idle_in_transaction_session_timeout`
  // are intentionally NOT set here: a blanket value would abort legitimate
  // long migrations, reports, and backfills. Prefer the app's Postgres role
  // (`ALTER ROLE myapp SET statement_timeout = '30s'`); or add them to this
  // block if you want them app-wide.
  const dbConnectionDefaults: NonNullable<SingleDbCredential['pg']> = {
    connectionTimeoutMillis: AppEnv.integer('DB_CONNECTION_TIMEOUT_MS', { optional: true }) || 5000,
    application_name: AppEnv.string('APP_NAME', { optional: true }) || 'app',
    keepAlive: true,
  }

  app.set('db', {
    primary: {
      user: AppEnv.string('DB_USER'),
      password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
      host: AppEnv.string('DB_HOST'),
      name: AppEnv.string('DB_NAME'),
      port: AppEnv.integer('DB_PORT'),
      ssl: dbSsl,
      pg: dbConnectionDefaults,
    },
    replica: AppEnv.string('REPLICA_DB_HOST', { optional: true })
      ? {
          user: AppEnv.string('DB_USER'),
          password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
          host: AppEnv.string('REPLICA_DB_HOST'),
          name: AppEnv.string('DB_NAME'),
          port: AppEnv.integer('REPLICA_DB_PORT', { optional: true }) || AppEnv.integer('DB_PORT'),
          ssl: dbSsl,
          pg: dbConnectionDefaults,
        }
      : undefined,
  })

  app.set('encryption', {
    columns: {
      current: {
        algorithm: 'aes-256-gcm',
        key: AppEnv.string('COLUMN_ENCRYPTION_KEY'),
      },
    },
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
