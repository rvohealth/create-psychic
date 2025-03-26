import * as crypto from 'crypto'
import defaultDbCredentials from '../helpers/defaultDbCredentials.js'

export default class EnvBuilder {
  public static build({ env, appName }: { env: 'test' | 'development' | 'production'; appName: string }) {
    const creds = defaultDbCredentials(appName, env)
    return `\
DB_USER=${creds.user}
DB_NAME=${creds.name}
DB_PORT=${creds.port}
DB_HOST=${creds.host}
REPLICA_DB_PORT=${creds.port}
REPLICA_DB_HOST=${creds.host}
DB_NO_SSL=1
APP_ENCRYPTION_KEY="${generateKey()}"
TZ=UTC
`
  }
}

function generateKey() {
  return crypto.randomBytes(32).toString('base64')
}
