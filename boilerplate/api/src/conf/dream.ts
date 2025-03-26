import { DreamApplication } from '@rvoh/dream'
import importAll from '../app/helpers/importAll.js'
import importDefault from '../app/helpers/importDefault.js'
import srcPath from '../app/helpers/srcPath.js'
import AppEnv from './AppEnv.js'
import inflections from './inflections.js'

export default async function (app: DreamApplication) {
  app.set('primaryKeyType', <PRIMARY_KEY_TYPE>)
  app.set('inflections', inflections)

  await app.load('models', srcPath('app', 'models'), path => importDefault(path))
  await app.load('services', srcPath('app', 'services'), path => importDefault(path))
  await app.load('serializers', srcPath('app', 'serializers'), path => importAll(path))

  // provides a list of path overrides for your app. This is optional, and will default
  // to the paths expected for a typical psychic application.
  app.set('paths', {})

  app.set('parallelTests', Number(AppEnv.integer('DREAM_PARALLEL_TESTS') || '1'))

  app.set('db', {
    primary: {
      user: AppEnv.string('DB_USER'),
      password: AppEnv.string('DB_PASSWORD'),
      host: AppEnv.string('DB_HOST'),
      name: AppEnv.string('DB_NAME'),
      port: AppEnv.integer('DB_PORT'),
      // only connect to primary db insecurely if `DB_NO_SSL` is explicitly set
      useSsl: !AppEnv.boolean('DB_NO_SSL'),
    },
    replica: AppEnv.isProduction
      ? {
          user: AppEnv.string('DB_USER'),
          password: AppEnv.string('DB_PASSWORD'),
          host: AppEnv.string('REPLICA_DB_HOST'),
          name: AppEnv.string('DB_NAME'),
          port: AppEnv.integer('REPLICA_DB_PORT'),
          // only connect to replica db insecurely if `DB_NO_SSL` is explicitly set
          useSsl: !AppEnv.boolean('DB_NO_SSL'),
        }
      : undefined,
  })
}
