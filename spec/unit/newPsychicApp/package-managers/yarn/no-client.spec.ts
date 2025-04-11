import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with no client', () => {
  it('correctly provisions an api-only app', async () => {
    await newSpecPsychicApp('yarn', 'howyadoin', {
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
        yarn uspec &&
        yarn uspec:js`
    )
  }, 120_000)
})
