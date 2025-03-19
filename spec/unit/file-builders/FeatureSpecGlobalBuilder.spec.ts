import FeatureSpecGlobalBuilder from '../../../src/file-builders/FeatureSpecGlobalBuilder.js'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'

describe('FeatureSpecGlobalBuilder', () => {
  const baseOptions: InitPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.build', () => {
    context('basic', () => {
      it('adds client fspec devserver to boilerplate', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions }
        const res = await FeatureSpecGlobalBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/spec/features/setup/globalSetup-basic.ts', res)
      })
    })

    context('with client', () => {
      it('adds client fspec devserver to boilerplate', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await FeatureSpecGlobalBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/spec/features/setup/globalSetup-with-client.ts', res)
      })
    })

    context('with admin', () => {
      it('adds admin fspec devserver to boilerplate', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, adminClient: 'react' }
        const res = await FeatureSpecGlobalBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture('expected-files/spec/features/setup/globalSetup-with-admin.ts', res)
      })
    })

    context('with both client AND admin', () => {
      it('adds both admin and client fspec devservers to boilerplate', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, client: 'react', adminClient: 'react' }
        const res = await FeatureSpecGlobalBuilder.build({ appName: 'howyadoin', options })

        await expectToMatchFixture(
          'expected-files/spec/features/setup/globalSetup-with-client-and-admin.ts',
          res
        )
      })
    })
  })
})
