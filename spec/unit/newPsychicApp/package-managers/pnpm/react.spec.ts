import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newPsychicApp('howyadoin', {
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
        pnpm psy g:model PackageManagerPnpmReactUser email:string &&
        NODE_ENV=test pnpm psy db:migrate &&
        pnpm uspec &&
        pnpm fspec`
    )
  }, 120_000)
})
