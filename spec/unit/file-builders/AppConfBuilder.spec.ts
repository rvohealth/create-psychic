import AppConfigBuilder from '../../../src/file-builders/AppConfigBuilder.js'
import { InitPsychicAppCliOptions, NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'

describe('AppConfBuilder', () => {
  describe('.buildForInit', () => {
    const baseOptions: InitPsychicAppCliOptions = initPsychicAppDefaults()

    it('builds for initialization, including paths', async () => {
      const res = await AppConfigBuilder.buildForInit({ appName: 'howyadoin', options: baseOptions })
      await expectToMatchFixture('expected-files/app/init/basic.ts', res)
    })
  })

  describe('.build', () => {
    const baseOptions: NewPsychicAppCliOptions = {
      packageManager: 'yarn',
      workers: false,
      websockets: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    }

    context('with backgroundWorkers: false', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/basic.ts', res)
      })
    })

    context('with backgroundWorkers: true', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-workers.ts', res)
      })
    })

    context('with websockets: true', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, websockets: true }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-websockets.ts', res)
      })
    })

    context('with backgroundWorkers: true and websockets: true', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true, websockets: true }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-workers-and-websockets.ts', res)
      })
    })

    context('with client', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-client.ts', res)
      })
    })

    context('with admin', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-admin.ts', res)
      })
    })

    context('with both client AND admin', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react', adminClient: 'react' }
        const res = await AppConfigBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/app/with-client-and-admin.ts', res)
      })
    })
  })
})
