import generateEncryptionKey from './generateEncryptionKey'

export default class EnvBuilder {
  public static build({ env, appName }: { env: 'test' | 'development' | 'production'; appName: string }) {
    return `\
DB_USER=
DB_NAME=${snakeify(appName)}_${env}
DB_PORT=5432
DB_HOST=localhost
APP_ENCRYPTION_KEY='${generateEncryptionKey()}'
`
  }
}

function snakeify(str: any): string {
  return str
    .replace(/(?:^|\.?)([A-Z])/g, (_: string, y: string) => '_' + y.toLowerCase())
    .replace(/^_/, '')
    .toLowerCase()
}
