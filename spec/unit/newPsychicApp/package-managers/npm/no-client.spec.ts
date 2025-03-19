import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions an api-only app', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'npm',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/package-lock.json')
    await sspawn(
      `\
        cd howyadoin &&
        npm run psy g:model PackageManagerNpmNoClientUser email:string &&
        NODE_ENV=test npm run psy db:migrate &&
        npm run uspec`
    )
  }, 120_000)
})
