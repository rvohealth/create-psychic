import newPsychicApp from '../../../src/helpers/newPsychicApp.js'
import expectFile from '../../helpers/expectFile.js'
import expectNoFile from '../../helpers/expectNoFile.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import readFile from '../../helpers/readFile.js'

describe('newPsychicApp without websockets or background jobs', () => {
  it('builds app without websockets or background configurations', async () => {
    await newPsychicApp('howyadoin', {
      websockets: false,
      workers: true,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectNoFile('howyadoin/src/conf/websockets.ts')
    await expectFile('howyadoin/src/conf/workers.ts')
    await expectFile('howyadoin/src/app/models/ApplicationBackgroundedModel.ts')
    await expectFile('howyadoin/src/app/services/ApplicationBackgroundedService.ts')
    await expectFile('howyadoin/src/app/services/ApplicationScheduledService.ts')

    await expectToMatchFixture(
      'expected-files/initializePsychicApplication/yes-workers-no-websockets.ts',
      await readFile('howyadoin/src/conf/initializePsychicApplication.ts')
    )

    await expectToMatchFixture(
      'expected-files/app/yes-workers.ts',
      await readFile('howyadoin/src/conf/app.ts')
    )
  })
})
