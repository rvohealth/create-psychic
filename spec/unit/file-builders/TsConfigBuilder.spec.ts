import * as fs from 'node:fs'
import * as path from 'node:path'
import ts from 'typescript'
import TsConfigBuilder from '../../../src/file-builders/TsConfigBuilder.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'

interface TsConfig {
  compilerOptions: { paths: Record<string, string[]>; types?: string[]; module?: string }
}

function readTsConfig(file: string) {
  return JSON.parse(fs.readFileSync(`howyadoin/${file}`, 'utf8')) as TsConfig
}

function writeAppFile(file: string) {
  fs.mkdirSync(path.dirname(`howyadoin/${file}`), { recursive: true })
  fs.writeFileSync(`howyadoin/${file}`, 'export {}\n')
}

// The file TypeScript resolves `specifier` to when `fromFile` imports it, under the tsconfig init wrote
function resolveFrom(tsconfigFile: string, fromFile: string, specifier: string) {
  const tsconfigPath = path.resolve('howyadoin', tsconfigFile)
  const config = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => {},
    },
  )
  if (!config) throw new Error(`could not parse ${tsconfigPath}`)

  const resolved = ts.resolveModuleName(
    specifier,
    path.resolve('howyadoin', fromFile),
    config.options,
    ts.sys,
  ).resolvedModule?.resolvedFileName

  return resolved && path.relative(path.resolve('howyadoin'), resolved)
}

// init copies template files that import each other through `#` names, and maps those names in the
// host's tsconfig `paths` (the spec hooks remove `howyadoin` before each spec).
describe('TsConfigBuilder', () => {
  const hashNames = [
    '#conf/*',
    '#controllers/*',
    '#models/*',
    '#serializers/*',
    '#services/*',
    '#spec/*',
    '#src/*',
    '#src/types/*',
    '#src/utils/*',
  ]
  // `#spec/*` is left out: its target derivation predates the switch to `#` and is not pinned here
  const expectedTargets = {
    '#conf/*': ['./src/api/conf/*'],
    '#controllers/*': ['./src/api/app/controllers/*'],
    '#models/*': ['./src/api/app/models/*'],
    '#serializers/*': ['./src/api/app/serializers/*'],
    '#services/*': ['./src/api/app/services/*'],
    '#src/*': ['./src/*'],
    '#src/types/*': ['./src/types/*'],
    '#src/utils/*': ['./src/api/utils/*'],
  }

  beforeEach(() => {
    fs.mkdirSync('howyadoin', { recursive: true })
  })

  it('adds the # names to an existing tsconfig.json, keeping its own paths', () => {
    fs.writeFileSync(
      'howyadoin/tsconfig.json',
      JSON.stringify({ compilerOptions: { moduleResolution: 'bundler', paths: { '@/*': ['./src/*'] } } }),
    )

    TsConfigBuilder.build({ options: initPsychicAppDefaults() })

    const { paths } = readTsConfig('tsconfig.json').compilerOptions
    expect(Object.keys(paths)).toEqual(['@/*', ...hashNames])
    expect(paths).toMatchObject({ '@/*': ['./src/*'], ...expectedTargets })
  })

  it('adds the # names to the template tsconfig it copies when the host has none', () => {
    TsConfigBuilder.build({ options: initPsychicAppDefaults() })

    const { compilerOptions } = readTsConfig('tsconfig.build.json')
    expect(compilerOptions.module).toEqual('nodenext')
    expect(Object.keys(compilerOptions.paths)).toEqual(hashNames)
    expect(compilerOptions.paths).toMatchObject(expectedTargets)
  })

  // The copied models, controllers and services import `#src/types/...` and `#src/utils/...`, which a new
  // app's `#src/*` finds under ./src. init writes those folders to its types and utils paths instead.
  it('points the #src/types and #src/utils names at the types and utils paths init copies to', () => {
    TsConfigBuilder.build({
      options: { ...initPsychicAppDefaults(), typesPath: 'lib/types', utilsPath: 'lib/utils' },
    })

    const { paths } = readTsConfig('tsconfig.build.json').compilerOptions
    expect(paths['#src/types/*']).toEqual(['./lib/types/*'])
    expect(paths['#src/utils/*']).toEqual(['./lib/utils/*'])
    expect(paths['#src/*']).toEqual(['./src/*'])
  })

  it("resolves the copied ApplicationController's #src imports to the files init writes", () => {
    fs.writeFileSync(
      'howyadoin/tsconfig.json',
      JSON.stringify({ compilerOptions: { module: 'esnext', moduleResolution: 'bundler' } }),
    )
    const controller = 'src/api/app/controllers/ApplicationController.ts'
    writeAppFile(controller)
    writeAppFile('src/api/utils/i18n.ts')
    writeAppFile('src/types/psychic.ts')
    // a host file at the path the general `#src/*` name points to must not win over init's utils path
    writeAppFile('src/utils/i18n.ts')

    TsConfigBuilder.build({ options: initPsychicAppDefaults() })

    expect(resolveFrom('tsconfig.json', controller, '#src/utils/i18n.js')).toEqual('src/api/utils/i18n.ts')
    // init with `importExtension: 'none'`, as for Next.js, strips the `.js`
    expect(resolveFrom('tsconfig.json', controller, '#src/utils/i18n')).toEqual('src/api/utils/i18n.ts')
    expect(resolveFrom('tsconfig.json', controller, '#src/types/psychic.js')).toEqual('src/types/psychic.ts')
  })
})
