import newPsychicApp from '../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../src/helpers/sspawn.js'

describe('newPsychicApp with uuid', () => {
  it('builds app with default uuid migration, so that subsequent uses of uuid will behave', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'uuid',
    })

    await sspawn(
      `\
        cd howyadoin &&
        yarn psy g:model PackageManagerPnpmUuidUser email:string &&
        NODE_ENV=test yarn psy db:migrate &&
        yarn uspec`
    )
  }, 120_000)
})
