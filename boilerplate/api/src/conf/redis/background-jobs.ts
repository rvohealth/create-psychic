import { PsychicRedisConnectionOptions } from 'psychic'

export default async (): Promise<PsychicRedisConnectionOptions> => {
  const username = process.env.BACKGROUND_JOB_REDIS_USER || undefined
  const password = process.env.BACKGROUND_JOB_REDIS_PASSWORD || undefined
  const host = process.env.BACKGROUND_JOB_REDIS_HOST || 'localhost'
  const port = process.env.BACKGROUND_JOB_REDIS_PORT || ''

  return {
    username,
    password,
    host,
    port,
    secure: false,
  }
}
