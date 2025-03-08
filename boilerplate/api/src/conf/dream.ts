import { DreamApplication } from '@rvohealth/dream'
import { productionEnv } from '../helpers/environment'
import inflections from './inflections'
import srcPath from '../app/helpers/srcPath'
import importModels from './importers/importModels'
import importServices from './importers/importServices'
import importSerializers from './importers/importSerializers'

export default async function (app: DreamApplication) {
  app.set('primaryKeyType', <PRIMARY_KEY_TYPE>)
  app.set('inflections', inflections)

  app.load('models', srcPath('app', 'models'), await importModels())
  app.load('services', srcPath('app', 'services'), await importServices())
  app.load('serializers', srcPath('app', 'serializers'), await importSerializers())

  // provides a list of path overrides for your app. This is optional, and will default
  // to the paths expected for a typical psychic application.
  app.set('paths', {})

  app.set('parallelTests', Number(process.env.DREAM_PARALLEL_TESTS || '1'))

  app.set('db', {
    primary: {
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      host: process.env.DB_HOST!,
      name: process.env.DB_NAME!,
      port: parseInt(process.env.DB_PORT!),
      useSsl: process.env.DB_USE_SSL === '1',
    },
    replica: productionEnv()
      ? {
          user: process.env.DB_USER!,
          password: process.env.DB_PASSWORD!,
          host: process.env.READER_DB_HOST!,
          name: process.env.DB_NAME!,
          port: parseInt(process.env.READER_DB_PORT!),
          useSsl: process.env.DB_USE_SSL === '1',
        }
      : undefined,
  })
}
