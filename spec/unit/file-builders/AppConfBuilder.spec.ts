import AppConfigBuilder from '../../../src/file-builders/AppConfigBuilder.js'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'

describe('AppConfBuilder', () => {
  const baseOptions: InitPsychicAppCliOptions = {
    packageManager: 'yarn',
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

    context('with client', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-client.ts', res)
      })
    })

    context('with admin', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, adminClient: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-admin.ts', res)
      })
    })

    context('with both client AND admin', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, client: 'react', adminClient: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-client-and-admin.ts', res)
      })
    })
  })
})
