import InitializePsychicAppBuilder from '../../../src/file-builders/InitializePsychicAppBuilder.js'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'

describe('InitializePsychicAppBuilder', () => {
  const baseOptions: InitPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.build', () => {
    context('with backgroundWorkers: false and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions }
        const res = await InitializePsychicAppBuilder.build(options)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/no-workers-no-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: false and ws: true', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, websockets: true }
        const res = await InitializePsychicAppBuilder.build(options)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/no-workers-yes-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: true and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await InitializePsychicAppBuilder.build(options)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/yes-workers-no-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: true and ws: true', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, workers: true, websockets: true }
        const res = await InitializePsychicAppBuilder.build(options)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/yes-workers-yes-websockets.ts',
          res!
        )
      })
    })
  })
})
