import * as fs from 'node:fs'
import * as path from 'node:path'
import addRootPathForCoreSpecs from '../helpers/init/addRootPathForCoreSpecs.js'
import internalSrcPath from '../helpers/internalSrcPath.js'
import { InitPsychicAppCliOptions } from '../helpers/newPsychicApp.js'

interface TsConfigStub {
  compilerOptions?: {
    baseUrl?: string
    paths?: Record<string, string[]>
  }
}

export default class TsConfigBuilder {
  public static build({ options }: { options: InitPsychicAppCliOptions }) {
    const tsconfigBuildPath = path.join(process.cwd(), addRootPathForCoreSpecs('tsconfig.build.json'))
    let tsconfigPath = path.join(process.cwd(), addRootPathForCoreSpecs('tsconfig.json'))

    if (!fs.existsSync(tsconfigPath)) {
      fs.cpSync(internalSrcPath('..', 'boilerplate', 'tsconfig.build.json'), tsconfigBuildPath)
      fs.cpSync(internalSrcPath('..', 'boilerplate', 'tsconfig.json'), tsconfigPath)
      tsconfigPath = tsconfigBuildPath
    }

    const json = JSON.parse(fs.readFileSync(tsconfigPath).toString()) as TsConfigStub

    if (!json.compilerOptions) json.compilerOptions = {}
    const compilerOptions = json.compilerOptions

    if (!compilerOptions.baseUrl) compilerOptions.baseUrl = './'

    if (!compilerOptions.paths) compilerOptions.paths = {}
    const paths = compilerOptions.paths

    paths['@conf/*'] = [`./${options.confPath}/*`]
    paths['@controllers/*'] = [`./${options.controllersPath}/*`]
    paths['@models/*'] = [`./${options.modelsPath}/*`]
    paths['@serializers/*'] = [`./${options.serializersPath}/*`]
    paths['@services/*'] = [`./${options.servicesPath}/*`]
    paths['@spec/*'] = [`./${options.modelSpecsPath.replace(/\/models/, '')}/*`]
    paths['@src/*'] = [`./src/*`]

    fs.writeFileSync(tsconfigPath, JSON.stringify(json, null, 2))
  }
}
