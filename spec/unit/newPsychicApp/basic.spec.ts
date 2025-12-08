import sspawn from '../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../helpers/assertions/expectNoWorkers.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../helpers/newSpecPsychicApp.js'
import readFile from '../../helpers/readFile.js'

describe('newPsychicApp without websockets or background jobs', () => {
  it('builds app without websockets or background configurations', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectNoWebsockets()
    await expectNoWorkers()

    await expectToMatchFixture('expected-files/app/basic.ts', await readFile('howyadoin/src/conf/app.ts'))

    await sspawn(
      `\
        cd howyadoin &&
        yarn build`,
    )
  }, 120_000)
})
