import newPsychicApp from '../../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'

describe('newPsychicApp with react client', () => {
  it('correctly provisions a react client', async () => {
    await newPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'react',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/yarn.lock')
    await sspawn(
      `\
        cd howyadoin/api &&
        yarn psy g:model PackageManagerYarnReactUser email:string &&
        NODE_ENV=test yarn psy db:migrate &&
        yarn uspec &&
        yarn fspec`
    )
  }, 120_000)
})
