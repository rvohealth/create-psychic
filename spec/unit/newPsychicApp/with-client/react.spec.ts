import newPsychicApp from '../../../../src/helpers/newPsychicApp'
import expectFileToContain from '../../../helpers/expectFileToContain'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newPsychicApp('howyadoin', {
      websockets: false,
      workers: false,
      client: 'react',
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
  })
})
