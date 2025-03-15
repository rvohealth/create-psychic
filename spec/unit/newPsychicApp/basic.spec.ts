import newPsychicApp from '../../../src/helpers/newPsychicApp.js'
import expectNoFile from '../../helpers/expectNoFile.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import readFile from '../../helpers/readFile.js'

describe('newPsychicApp without websockets or background jobs', () => {
  it('builds app without websockets or background configurations', async () => {
    await newPsychicApp('howyadoin', {
      websockets: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectNoFile('howyadoin/src/conf/workers.ts')
    await expectNoFile('howyadoin/src/conf/websockets.ts')
    await expectNoFile('howyadoin/src/app/helpers/ws.ts')
    await expectNoFile('howyadoin/src/app/models/ApplicationBackgroundedModel.ts')
    await expectNoFile('howyadoin/src/app/services/ApplicationBackgroundedService.ts')
    await expectNoFile('howyadoin/src/app/services/ApplicationScheduledService.ts')

    await expectToMatchFixture(
      'expected-files/initializePsychicApplication/no-workers-no-websockets.ts',
      await readFile('howyadoin/src/conf/initializePsychicApplication.ts')
    )

    await expectToMatchFixture(
      'expected-files/app/no-workers.ts',
      await readFile('howyadoin/src/conf/app.ts')
    )
  })
})
