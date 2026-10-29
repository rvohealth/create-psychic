import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'react',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')
    await expectFileToContain('./howyadoin/client/pnpm-workspace.yaml', 'strictDepBuilds: false')
    // the client is its own pnpm project, so it carries its own cooldown
    await expectFileToContain('./howyadoin/client/pnpm-workspace.yaml', 'minimumReleaseAge: 4320')
    await expectFileToContain('./howyadoin/api/pnpm-workspace.yaml', 'minimumReleaseAge: 4320')
    // and its own copy of the api's pnpm floor, which the api's `engines` does not reach
    const clientPackageJson = JSON.parse(fs.readFileSync('./howyadoin/client/package.json', 'utf8')) as {
      engines?: unknown
    }
    expect(clientPackageJson.engines).toEqual({ pnpm: '>=10.19.0' })

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    // The client's own lint (`eslint .`, configured by the scaffold's eslint.config.js) passes,
    // so a file the generator writes into the client that breaks it fails this spec
    await sspawn('pnpm lint', { cwd: './howyadoin/client' })

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
