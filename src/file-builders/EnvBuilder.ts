import * as crypto from 'crypto'
import defaultDbCredentials from '../helpers/defaultDbCredentials.js'

export default class EnvBuilder {
  public static build({ env, appName }: { env: 'test' | 'development' | 'production'; appName: string }) {
    const creds = defaultDbCredentials(appName, env)
    const base = `\
DB_USER=${creds.user}
DB_NAME=${creds.name}
DB_PORT=${creds.port}
DB_HOST=${creds.host}
DB_PASSWORD=${creds.password}
REPLICA_DB_PORT=${creds.port}
REPLICA_DB_HOST=${creds.host}
DB_NO_SSL=1
APP_ENCRYPTION_KEY="${generateKey()}"
COLUMN_ENCRYPTION_KEY="${generateKey()}"
WEB_SERVICE=1
WORKER_SERVICE=${env === 'test' ? 0 : 1}
CORS_HOSTS='${
      env === 'test'
        ? '["http://localhost:3050", "http://localhost:3051", "http://localhost:3052"]'
        : '["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]'
    }'
CLIENT_HOST='${env === 'test' ? 'http://localhost:3050' : 'http://localhost:3000'}'
ADMIN_HOST='${env === 'test' ? 'http://localhost:3051' : 'http://localhost:3001'}'
INTERNAL_HOST='${env === 'test' ? 'http://localhost:3052' : 'http://localhost:3002'}'
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
