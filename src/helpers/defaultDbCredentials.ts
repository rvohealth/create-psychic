import * as os from 'os'
import snakeify from './snakeify.js'

export default function defaultDbCredentials(appName: string, env: string) {
  return {
    user: process.env.CI ? 'psychic' : os.userInfo().username,
    password: process.env.DB_PASSWORD || '',
    name: `${snakeify(appName)}_${env}`,
    port: 5432,
    host: 'localhost',
  }
}
