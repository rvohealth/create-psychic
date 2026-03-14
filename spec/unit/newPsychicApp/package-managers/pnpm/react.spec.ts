import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      psychicSkill: false,
      workers: false,
      client: 'react',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin/api &&
        pnpm uspec &&
        pnpm uspec:js &&
        pnpm fspec &&
        pnpm fspec:js &&
        pnpm build &&
        pnpm build:spec`,
    )
  }, 120_000)
})
