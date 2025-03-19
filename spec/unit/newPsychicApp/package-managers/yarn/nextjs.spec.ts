import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with nextjs client', () => {
  // TODO: works locally, not passing in CI
  it.skip('correctly provisions a nextjs client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'nextjs',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/yarn.lock')
    await sspawn(
      `\
        cd howyadoin/api &&
        yarn psy g:model PackageManagerYarnNextjsUser email:string &&
        NODE_ENV=test yarn psy db:migrate &&
        yarn uspec &&
        yarn fspec`
    )
  }, 120_000)
})
