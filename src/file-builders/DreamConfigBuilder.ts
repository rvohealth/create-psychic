import * as fs from 'node:fs/promises'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../helpers/newPsychicApp.js'
import pathToArgs from '../helpers/pathToArgs.js'
import rewriteEsmImports from '../helpers/rewriteEsmImports.js'

export default class DreamConfigBuilder {
  public static async build({ options }: { appName: string; options: NewPsychicAppCliOptions }) {
    const contents = (
      await fs.readFile(internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'dream.ts'))
    ).toString()

    return contents
      .replace('<PRIMARY_KEY_TYPE>', `'${options.primaryKeyType}'`)
      .replace('<PSYCHIC_IMPORT>', "\nimport { PsychicApp } from '@rvoh/psychic'")
      .replace(/<PSYCHIC_OR_DREAM_APP>/g, 'PsychicApp')
      .replace('<DREAM_PATHS>', "  app.set('paths', {})")
      .replace('<MODELS_PATH>', "srcPath('app', 'models')")
      .replace('<IMPORT_STYLE>', '')
      .replace('<PROJECT_ROOT>', '')
      .replace('<SERIALIZERS_PATH>', "srcPath('app', 'serializers')")
  }

  public static async buildForInit({ options }: { appName: string; options: InitPsychicAppCliOptions }) {
    const boilerplateFilepath = internalSrcPath('..', 'boilerplate', 'api', 'src', 'conf', 'dream.ts')

    const contents = (await fs.readFile(boilerplateFilepath)).toString()

    const modifiedContents = contents
      .replace('<PRIMARY_KEY_TYPE>', `'${options.primaryKeyType}'`)
      .replace('<PSYCHIC_IMPORT>', '')
      .replace(/<PSYCHIC_OR_DREAM_APP>/g, 'DreamApp')
      .replace(
        '<IMPORT_STYLE>',
        options.importExtension === '.js'
          ? ''
          : `\n  app.set('importExtension', '${options.importExtension}')`
      )
      .replace(
        '<PROJECT_ROOT>',
        `
  app.set('projectRoot', srcPath('..'))`
      )
      .replace('<MODELS_PATH>', `srcPath('..', ${pathToArgs(options.modelsPath)})`)
      .replace('<SERIALIZERS_PATH>', `srcPath('..', ${pathToArgs(options.serializersPath)})`)
      .replace(
        '<DREAM_PATHS>',
        `\
  app.set('paths', {
    conf: '${options.confPath}',
    db: '${options.dbPath}',
    types: '${options.typesPath}',
    factories: '${options.factoriesPath}',
    models: '${options.modelsPath}',
    modelSpecs: '${options.modelSpecsPath}',
    serializers: '${options.serializersPath}',
  })\
`
      )

    return options.importExtension === '.js'
      ? modifiedContents
      : rewriteEsmImports(modifiedContents, options.importExtension)
  }
}
