import newPsychicApp from '../../../../src/helpers/newPsychicApp.js'
import expectFileToContain from '../../../helpers/expectFileToContain.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newPsychicApp('howyadoin', {
      websockets: false,
      workers: false,
      client: 'react',
      adminClient: 'react',
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
!.yarn/versions`
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
!.yarn/versions`
    )
  }, 20000)
})
