import { describe as context } from '@jest/globals'
import InitializePsychicAppBuilder from '../../../src/file-builders/InitializePsychicAppBuilder'
import { NewAppCLIOptions } from '../../../src/helpers/gatherUserInput'
import expectToMatchFixture from '../../helpers/expectToMatchFixture'

describe('InitializePsychicAppBuilder', () => {
  describe('.build', () => {
    context('with backgroundWorkers: false and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const res = await InitializePsychicAppBuilder.build({
          backgroundWorkers: false,
          ws: false,
        } as NewAppCLIOptions)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/no-workers-no-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: false and ws: true', () => {
      it('returns the app with the specified options', async () => {
        const res = await InitializePsychicAppBuilder.build({
          backgroundWorkers: false,
          ws: true,
        } as NewAppCLIOptions)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/no-workers-yes-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: true and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const res = await InitializePsychicAppBuilder.build({
          backgroundWorkers: true,
          ws: false,
        } as NewAppCLIOptions)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/yes-workers-no-websockets.ts',
          res!
        )
      })
    })

    context('with backgroundWorkers: true and ws: true', () => {
      it('returns the app with the specified options', async () => {
        const res = await InitializePsychicAppBuilder.build({
          backgroundWorkers: true,
          ws: true,
        } as NewAppCLIOptions)

        await expectToMatchFixture(
          'expected-files/initializePsychicApplication/yes-workers-yes-websockets.ts',
          res!
        )
      })
    })
  })
})
