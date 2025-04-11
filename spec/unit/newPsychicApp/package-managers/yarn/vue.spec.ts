import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with vue client', () => {
  it('correctly provisions a vue client', async () => {
    await newSpecPsychicApp('yarn', 'howyadoin', {
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
        yarn uspec &&
        yarn uspec:js &&
        yarn fspec &&
        yarn fspec:js`
    )
  }, 120_000)
})
