import * as fs from 'node:fs'
import * as path from 'node:path'
import AppConfigBuilder from '../file-builders/AppConfigBuilder.js'
import DreamConfigBuilder from '../file-builders/DreamConfigBuilder.js'
import EnvBuilder from '../file-builders/EnvBuilder.js'
import FeatureSpecExampleBuilder from '../file-builders/FeatureSpecExampleBuilder.js'
import FeatureSpecGlobalBuilder from '../file-builders/FeatureSpecGlobalBuilder.js'
import PackagejsonBuilder from '../file-builders/PackagejsonBuilder.js'
import apiOnlyOptions from './apiOnlyOptions.js'
import copyRecursive from './copyRecursive.js'
import getApiRoot from './getApiRoot.js'
import internalSrcPath from './internalSrcPath.js'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'

export default async function copyApiBoilerplate(appName: string, options: InitPsychicAppCliOptions) {
  const appRoot = path.join('.', appName)
  const apiRoot = getApiRoot(appName, options)

  if (!apiOnlyOptions(options)) fs.mkdirSync(appRoot)

  copyRecursive(internalSrcPath('..', 'boilerplate', 'api'), apiRoot)

  fs.cpSync(internalSrcPath('..', 'boilerplate', 'README.md'), path.join(appRoot, 'README.md'))

  // yarnrc.yml included as non-dot-file so that it becomes part of the package
  // move it to .yarnrc.yml if using yarn; otherwise, delete it
  if (options.packageManager === 'yarn') {
    fs.renameSync(path.join(apiRoot, 'yarnrc.yml'), path.join(apiRoot, '.yarnrc.yml'))
  } else {
    fs.rmSync(path.join(apiRoot, 'yarnrc.yml'))
  }

  fs.renameSync(path.join(apiRoot, 'gitignore'), path.join(apiRoot, '.gitignore'))

  fs.writeFileSync(path.join(apiRoot, '.env'), EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(path.join(apiRoot, '.env.test'), EnvBuilder.build({ appName, env: 'test' }))
  fs.writeFileSync(path.join(apiRoot, 'package.json'), await PackagejsonBuilder.buildAPI(appName, options))

  fs.writeFileSync(
    path.join(apiRoot, 'src', 'conf', 'app.ts'),
    await AppConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(apiRoot, 'src', 'conf', 'dream.ts'),
    await DreamConfigBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(apiRoot, 'spec', 'features', 'setup', 'globalSetup.ts'),
    await FeatureSpecGlobalBuilder.build({ appName, options })
  )

  fs.writeFileSync(
    path.join(apiRoot, 'spec', 'features', 'example-feature-spec.spec.ts'),
    await FeatureSpecExampleBuilder.build(options)
  )

  if (!options.workers) {
    fs.rmSync(path.join(apiRoot, 'src', 'worker.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'conf', 'initializers', 'workers.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'models', 'ApplicationBackgroundedModel.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'services', 'ApplicationBackgroundedService.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'app', 'services', 'ApplicationScheduledService.ts'))
  }

  if (!options.websockets) {
    fs.rmSync(path.join(apiRoot, 'src', 'conf', 'initializers', 'websockets.ts'))
    fs.rmSync(path.join(apiRoot, 'src', 'utils', 'ws.ts'))
  }
}
