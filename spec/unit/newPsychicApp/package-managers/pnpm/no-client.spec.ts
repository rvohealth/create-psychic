import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with no client', () => {
  it('correctly provisions an api-only app', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      claudePsychicSkill: false,
      codexPsychicSkill: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/pnpm-lock.yaml')
    await expectFile('./howyadoin/docker-compose.yml')
    await expectFile('./howyadoin/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/no-client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin &&
        pnpm uspec &&
        pnpm uspec:js`,
    )
  }, 120_000)
})
