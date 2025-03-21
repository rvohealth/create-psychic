import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with no client', () => {
  it('correctly provisions an api-only app', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/pnpm-lock.yaml')
    await sspawn(
      `\
        cd howyadoin &&
        pnpm psy g:model PackageManagerPnpmNoClientUser email:string &&
        NODE_ENV=test pnpm psy db:migrate &&
        pnpm uspec`
    )
  }, 120_000)
})
