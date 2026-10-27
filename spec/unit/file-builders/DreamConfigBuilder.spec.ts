import DreamConfigBuilder from '../../../src/file-builders/DreamConfigBuilder.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'

// A Psychic app declares its import style (`importExtension`, `importAliasPrefix`) once, with
// `psy.set` in conf/app.ts, and Psychic passes it to Dream; Psychic throws at boot when conf/dream.ts
// sets a different, non-default value. So conf/dream.ts declares the import style only in a
// dream-only app, which has no conf/app.ts.
const importStyleLine = /importExtension|importAliasPrefix/

describe('DreamConfigBuilder', () => {
  describe('.build', () => {
    const options: NewPsychicAppCliOptions = {
      packageManager: 'pnpm',
      workers: false,
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    }

    it('declares no import style, which a new app declares in conf/app.ts', async () => {
      const res = await DreamConfigBuilder.build({ appName: 'howyadoin', options })
      expect(res).not.toMatch(importStyleLine)
    })
  })

  describe('.buildForInit', () => {
    context('for a Psychic app', () => {
      for (const importExtension of ['.js', '.ts', 'none'] as const) {
        it(`declares no import style with importExtension ${importExtension}, which conf/app.ts declares`, async () => {
          const options: InitPsychicAppCliOptions = { ...initPsychicAppDefaults(), importExtension }
          const res = await DreamConfigBuilder.buildForInit({ appName: 'howyadoin', options })
          expect(res).not.toMatch(importStyleLine)
        })
      }
    })

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
