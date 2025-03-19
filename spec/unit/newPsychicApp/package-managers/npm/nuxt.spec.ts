import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with nuxt client', () => {
  it.skip('correctly provisions a nuxt client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'npm',
      websockets: false,
      workers: false,
      client: 'nuxt',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/package-lock.json')
    await sspawn(
      `\
        cd howyadoin/api &&
        npm run psy g:model PackageManagerNpmNuxtUser email:string &&
        NODE_ENV=test npm run psy db:migrate &&
        npm run uspec &&
        npm run fspec`
    )
  }, 120_000)
})
