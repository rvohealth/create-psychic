import { describe as context } from '@jest/globals'
import AppConfigBuilder from '../../../src/file-builders/AppConfigBuilder'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp'
import expectToMatchFixture from '../../helpers/expectToMatchFixture'

describe('AppConfBuilder', () => {
  const baseOptions: InitPsychicAppCliOptions = {
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.build', () => {
    context('with backgroundWorkers: false', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/no-workers.ts', res)
      })
    })

    context('with backgroundWorkers: true', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/yes-workers.ts', res)
      })
    })
  })
})
