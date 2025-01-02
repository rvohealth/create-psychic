import { Env } from '@rvohealth/dream'

const EnvInternal = new Env<{
  string:
    | 'BG_JOBS_REDIS_HOST'
    | 'BG_JOBS_REDIS_USERNAME'
    | 'BG_JOBS_REDIS_PASSWORD'
    | 'WS_REDIS_HOST'
    | 'WS_REDIS_USERNAME'
    | 'WS_REDIS_PASSWORD'
    | 'PSYCHIC_SSL_KEY_PATH'
    | 'PSYCHIC_SSL_CERT_PATH'
    | 'APP_ENCRYPTION_KEY'
    | 'CLIENT_HOST'
  boolean: 'DEBUG' | 'REQUEST_LOGGING'
  integer: 'BG_JOBS_REDIS_PORT' | 'WS_REDIS_PORT'
}>()

export default EnvInternal
