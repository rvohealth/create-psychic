import { PsychicRedisConnectionOptions } from '@rvohealth/psychic'

export default async (): Promise<PsychicRedisConnectionOptions> => {
  const username = process.env.WS_REDIS_USERNAME || undefined
  const password = process.env.WS_REDIS_PASSWORD || undefined
  const host = process.env.WS_REDIS_HOST || 'localhost'
  const port = process.env.WS_REDIS_PORT || ''

  return {
    username,
    password,
    host,
    port,
    secure: process.env.NODE_ENV === 'production',
  }
}
