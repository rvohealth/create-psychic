import { Env } from '@rvoh/dream'

const EnvInternal = new Env<{
  boolean: 'CLIENT' | 'DB_NO_SSL' | 'DEBUG' | 'REQUEST_LOGGING' | 'WEB_SERVICE' | 'WORKER_SERVICE'

  integer: 'BG_JOBS_REDIS_PORT' | 'DB_PORT' | 'REPLICA_DB_PORT' | 'WS_REDIS_PORT'

  string:
    | 'APP_ENCRYPTION_KEY'
    | 'BG_JOBS_REDIS_HOST'
    | 'BG_JOBS_REDIS_PASSWORD'
    | 'BG_JOBS_REDIS_USERNAME'
    | 'CORS_HOSTS'
    | 'DB_HOST'
    | 'DB_NAME'
    | 'DB_PASSWORD'
    | 'DB_USER'
    | 'DREAM_PARALLEL_TESTS'
    | 'PSYCHIC_SSL_CERT_PATH'
    | 'PSYCHIC_SSL_KEY_PATH'
    | 'REPLICA_DB_HOST'
    | 'SSL_CERT_PATH'
    | 'SSL_KEY_PATH'
    | 'WS_REDIS_HOST'
    | 'WS_REDIS_PASSWORD'
    | 'WS_REDIS_USERNAME'
}>()

export default EnvInternal
