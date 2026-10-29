import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'

describe('newPsychicApp with vue client', () => {
  it('correctly provisions a vue client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      // with websockets, the feature specs below also start and stop the live Cable
      // that spec/features/setup/hooks.ts runs beside the api server
      websockets: true,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'vue',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/client-websockets.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin/api &&
        pnpm uspec &&
        pnpm uspec:js &&
        pnpm fspec &&
        pnpm fspec:js`,
    )
  }, 120_000)
})
