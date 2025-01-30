import { describe as context } from '@jest/globals'
import AppConfigBuilder from '../../../src/file-builders/AppConfigBuilder'
import { NewAppCLIOptions } from '../../../src/helpers/gatherUserInput'
import expectToMatchFixture from '../../helpers/expectToMatchFixture'

describe('AppConfBuilder', () => {
  describe('.build', () => {
    context('with backgroundWorkers: false', () => {
      it('returns the app with the specified options', async () => {
        const res = await AppConfigBuilder.build({
          appName: 'howyadoin',
          userOptions: {
            backgroundWorkers: false,
            apiOnly: true,
          } as NewAppCLIOptions,
        })
        await expectToMatchFixture('expected-files/app/no-workers.ts', res)
      })
    })

    context('with backgroundWorkers: true', () => {
      it('returns the app with the specified options', async () => {
        const res = await AppConfigBuilder.build({
          appName: 'howyadoin',
          userOptions: {
            backgroundWorkers: true,
            apiOnly: true,
          } as NewAppCLIOptions,
        })
        await expectToMatchFixture('expected-files/app/yes-workers.ts', res)
      })
    })
  })
})
