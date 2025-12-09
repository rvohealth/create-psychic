import sspawn from '../../../src/helpers/sspawn.js'
import newSpecPsychicApp from '../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with uuid', () => {
  it('builds app with default uuid migration, so that subsequent uses of uuid will behave', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'uuid7',
    })

    await sspawn(
      `\
        cd howyadoin &&
        yarn uspec`,
    )
  }, 120_000)
})
