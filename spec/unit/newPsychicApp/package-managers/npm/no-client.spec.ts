import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import { NPM_APP_GENERATION_SPECS_DISABLED } from './npmAppGenerationDisabled.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe.skipIf(NPM_APP_GENERATION_SPECS_DISABLED)('newPsychicApp with react client', () => {
  it('correctly provisions an api-only app', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'npm',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    })

    await expectFile('./howyadoin/package-lock.json')
    await expectFile('./howyadoin/docker-compose.yml')
    await expectFile('./howyadoin/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/npm/no-client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin &&
        npm run uspec &&
        npm run uspec:js`,
    )
  }, 120_000)
})
