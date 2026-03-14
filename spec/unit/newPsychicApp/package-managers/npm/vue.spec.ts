import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'

describe('newPsychicApp with vue client', () => {
  it('correctly provisions a vue client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'npm',
      websockets: false,
      psychicSkill: false,
      workers: false,
      client: 'vue',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/package-lock.json')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/npm/client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin/api &&
        npm run uspec &&
        npm run uspec:js &&
        npm run fspec &&
        npm run fspec:js`,
    )
  }, 120_000)
})
