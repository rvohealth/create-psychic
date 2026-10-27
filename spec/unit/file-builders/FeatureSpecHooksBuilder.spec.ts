import FeatureSpecHooksBuilder from '../../../src/file-builders/FeatureSpecHooksBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'

describe('FeatureSpecHooksBuilder', () => {
  const baseOptions: NewPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    claudePsychicSkill: false,
    agentsPsychicSkill: false,
    client: 'none',
    adminClient: 'none',
    internalClient: 'none',
    primaryKeyType: 'bigint',
  }

  describe('.build', () => {
    context('without websockets', () => {
      it('starts and stops only the api server', async () => {
        const res = await FeatureSpecHooksBuilder.build({ ...baseOptions })

        await expectToMatchFixture('expected-files/spec/features/setup/hooks-basic.ts', res)
      })
    })

    context('with websockets', () => {
      it('also starts a websocket server after the api server and stops it first', async () => {
        const res = await FeatureSpecHooksBuilder.build({ ...baseOptions, websockets: true })

        await expectToMatchFixture('expected-files/spec/features/setup/hooks-with-websockets.ts', res)
      })
    })
  })
})
