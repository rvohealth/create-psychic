import * as fs from 'node:fs'
import TsConfigBuilder from '../../../src/file-builders/TsConfigBuilder.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'

interface TsConfig {
  compilerOptions: { paths: Record<string, string[]>; types?: string[]; module?: string }
}

function readTsConfig(file: string) {
  return JSON.parse(fs.readFileSync(`howyadoin/${file}`, 'utf8')) as TsConfig
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
  ]
  // `#spec/*` is left out: its target derivation predates the switch to `#` and is not pinned here
  const expectedTargets = {
    '#conf/*': ['./src/api/conf/*'],
    '#controllers/*': ['./src/api/app/controllers/*'],
    '#models/*': ['./src/api/app/models/*'],
    '#serializers/*': ['./src/api/app/serializers/*'],
    '#services/*': ['./src/api/app/services/*'],
    '#src/*': ['./src/*'],
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
})
