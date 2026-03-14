import newPsychicApp from '../../../../src/helpers/newPsychicApp.js'
import expectFileToContain from '../../../helpers/expectFileToContain.js'
import expectToMatchFixture from '../../../helpers/expectToMatchFixture.js'
import readFile from '../../../helpers/readFile.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      psychicSkill: false,
      workers: false,
      client: 'react',
      adminClient: 'react',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFileToContain(
      './howyadoin/client/.gitignore',
      `
# yarn
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions`,
    )

    await expectFileToContain(
      './howyadoin/admin/.gitignore',
      `
# yarn
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions`,
    )

    await expectToMatchFixture(
      'expected-files/mcpJson/atRootOfAppWithClient.json',
      await readFile('howyadoin/.mcp.json'),
    )
  }, 60_000)
})
