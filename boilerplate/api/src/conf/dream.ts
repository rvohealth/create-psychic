import { DreamApplication } from '@rvoh/dream'
import importAll from './system/importAll.js'
import importDefault from './system/importDefault.js'
import srcPath from './system/srcPath.js'
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

  app.set('parallelTests', AppEnv.integer('DREAM_PARALLEL_TESTS', { optional: true }) || 1)

  app.set('db', {
    primary: {
      user: AppEnv.string('DB_USER'),
      password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
      host: AppEnv.string('DB_HOST'),
      name: AppEnv.string('DB_NAME'),
      port: AppEnv.integer('DB_PORT'),
      // only connect to replica db insecurely if `DB_NO_SSL` is explicitly set
      useSsl: !AppEnv.boolean('DB_NO_SSL'),
    },
    replica: AppEnv.string('REPLICA_DB_HOST', { optional: true })
      ? {
          user: AppEnv.string('DB_USER'),
          password: AppEnv.string('DB_PASSWORD', { optional: !AppEnv.isProduction }),
          host: AppEnv.string('REPLICA_DB_HOST'),
          name: AppEnv.string('DB_NAME'),
          port: AppEnv.integer('REPLICA_DB_PORT', { optional: true }) || AppEnv.integer('DB_PORT'),
          // only connect to replica db insecurely if `DB_NO_SSL` is explicitly set
          useSsl: !AppEnv.boolean('DB_NO_SSL'),
        }
      : undefined,
  })
}
