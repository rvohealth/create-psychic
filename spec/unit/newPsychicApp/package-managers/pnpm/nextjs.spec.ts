import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with nextjs client', () => {
  // TODO: works locally, not passing in CI
  it.skip('correctly provisions a nextjs client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      workers: false,
      client: 'nextjs',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await sspawn(
      `\
        cd howyadoin/api &&
        pnpm psy g:model PackageManagerPnpmNextjsUser email:string &&
        NODE_ENV=test pnpm psy db:migrate &&
        pnpm uspec &&
        pnpm fspec`
    )
  }, 120_000)
})
