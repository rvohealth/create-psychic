import { developmentOrTestEnv } from 'dream'
import { PsychicRedisConnectionOptions } from 'psychic'

export default async (): Promise<PsychicRedisConnectionOptions> => {
  const username = process.env.DATA_REDIS_USER || undefined
  const password = process.env.DATA_REDIS_PASSWORD || undefined
  const host = process.env.DATA_REDIS_HOST || 'localhost'
  const port = process.env.DATA_REDIS_PORT || ''

  return {
    username,
    password,
    host,
    port,
    secure: !developmentOrTestEnv(),
  }
}
