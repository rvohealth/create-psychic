import DreamConfigBuilder from '../../../src/file-builders/DreamConfigBuilder.js'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'

// A Psychic app declares its import style (`importExtension`, `importAliasPrefix`) once, with
// `psy.set` in conf/app.ts, so conf/dream.ts declares it only in a dream-only app, which has no
// conf/app.ts.
describe('DreamConfigBuilder', () => {
  describe('.buildForInit', () => {
    context('for a dream-only app', () => {
      it('declares the import style, with # aliases', async () => {
        const options: InitPsychicAppCliOptions = { ...initPsychicAppDefaults(), dreamOnly: true }
        const res = await DreamConfigBuilder.buildForInit({ appName: 'howyadoin', options })
        await expectToMatchFixture('expected-files/dream/init/basic.ts', res)
      })

      it('declares the chosen import extension', async () => {
        const options: InitPsychicAppCliOptions = {
          ...initPsychicAppDefaults(),
          dreamOnly: true,
          importExtension: 'none',
        }
        const res = await DreamConfigBuilder.buildForInit({ appName: 'howyadoin', options })
        expect(res).toContain(`\
  app.set('importExtension', 'none')
  app.set('importAliasPrefix', '#')
`)
      })
    })
  })
})
