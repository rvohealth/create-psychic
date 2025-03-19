import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with vue client', () => {
  it('correctly provisions a vue client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'vue',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/yarn.lock')
    await sspawn(
      `\
        cd howyadoin/api &&
        yarn psy g:model PackageManagerYarnVueUser email:string &&
        NODE_ENV=test yarn psy db:migrate &&
        yarn uspec &&
        yarn fspec`
    )
  }, 120_000)
})
