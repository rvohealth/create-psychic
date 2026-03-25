import * as crypto from 'crypto'
import defaultDbCredentials from '../helpers/defaultDbCredentials.js'

export default class EnvBuilder {
  public static build({ env, appName }: { env: 'test' | 'development' | 'production'; appName: string }) {
    const creds = defaultDbCredentials(appName, env)
    return this._build({
      env,
      user: creds.user,
      name: creds.name,
      port: creds.port,
      host: creds.host,
      password: creds.password,
      appEncryptionKey: `"${generateKey()}"`,
      columnEncryptionKey: `"${generateKey()}"`,
    })
  }

  public static buildExample({
    env,
    appName,
  }: {
    env: 'test' | 'development' | 'production'
    appName: string
  }) {
    const creds = defaultDbCredentials(appName, env)
    return this._build({
      env,
      user: '<db-user>',
      name: creds.name,
      port: creds.port,
      host: creds.host,
      password: creds.password,
      appEncryptionKey: '<paste the results of runnning: pnpm psy g:encryption-key>',
      columnEncryptionKey: '<paste the results of runnning: pnpm psy g:encryption-key>',
    })
  }

  private static _build({
    env,
    user,
    name,
    port,
    host,
    password,
    appEncryptionKey,
    columnEncryptionKey,
  }: {
    env: 'test' | 'development' | 'production'
    user: string
    name: string
    port: number
    host: string
    password: string
    appEncryptionKey: string
    columnEncryptionKey: string
  }) {
    const base = `\
DB_USER=${user}
DB_NAME=${name}
DB_PORT=${port}
DB_HOST=${host}
DB_PASSWORD=${password}
REPLICA_DB_PORT=${port}
REPLICA_DB_HOST=${host}
DB_NO_SSL=1
APP_ENCRYPTION_KEY=${appEncryptionKey}
COLUMN_ENCRYPTION_KEY=${columnEncryptionKey}
WEB_SERVICE=1
WORKER_SERVICE=${env === 'test' ? 0 : 1}
CORS_HOSTS='${
      env === 'test'
        ? '["http://localhost:3050", "http://localhost:3051", "http://localhost:3052"]'
        : '["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]'
    }'
CLIENT_APP_HOST='${env === 'test' ? 'http://localhost:3050' : 'http://localhost:3000'}'
ADMIN_APP_HOST='${env === 'test' ? 'http://localhost:3051' : 'http://localhost:3001'}'
INTERNAL_APP_HOST='${env === 'test' ? 'http://localhost:3052' : 'http://localhost:3002'}'
TZ=UTC
`
    return env === 'test'
      ? `${base}
DREAM_PARALLEL_TESTS=4
`
      : base
  }
}

function generateKey() {
  return crypto.randomBytes(32).toString('base64')
}
