import sspawn from '../../../src/helpers/sspawn.js'
import expectFile from '../../helpers/expectFile.js'
import expectNoFile from '../../helpers/expectNoFile.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../helpers/newSpecPsychicApp.js'
import readFile from '../../helpers/readFile.js'

describe('newPsychicApp without websockets or background jobs', () => {
  it('builds app without websockets or background configurations', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      workers: true,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectNoFile('howyadoin/src/conf/websockets.ts')
    await expectFile('howyadoin/src/worker.ts')
    await expectFile('howyadoin/src/conf/workers.ts')
    await expectFile('howyadoin/src/app/models/ApplicationBackgroundedModel.ts')
    await expectFile('howyadoin/src/app/services/ApplicationBackgroundedService.ts')
    await expectFile('howyadoin/src/app/services/ApplicationScheduledService.ts')

    await expectToMatchFixture(
      'expected-files/app/with-workers.ts',
      await readFile('howyadoin/src/conf/app.ts')
    )

    await sspawn(
      `\
        cd howyadoin &&
        yarn build`
    )
  }, 120_000)
})
