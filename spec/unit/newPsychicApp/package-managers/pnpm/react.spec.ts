import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      workers: false,
      client: 'react',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await sspawn(
      `\
        cd howyadoin/api &&
        pnpm uspec &&
        pnpm uspec:js &&
        pnpm fspec &&
        pnpm fspec:js &&
        pnpm build &&
        pnpm build:spec`
    )
  }, 120_000)
})
