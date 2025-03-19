import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with no client', () => {
  it('correctly provisions an api-only app', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/yarn.lock')
    await sspawn(
      `\
        cd howyadoin &&
        yarn psy g:model PackageManagerYarnNoClientUser email:string &&
        NODE_ENV=test yarn psy db:migrate &&
        yarn uspec`
    )
  }, 120_000)
})
