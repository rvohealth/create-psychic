import newPsychicApp from '../../../src/helpers/newPsychicApp'
import expectFile from '../../helpers/expectFile'
import expectNoFile from '../../helpers/expectNoFile'
import expectToMatchFixture from '../../helpers/expectToMatchFixture'
import readFile from '../../helpers/readFile'

describe('newPsychicApp without websockets or background jobs', () => {
  it('builds app without websockets or background configurations', async () => {
    await newPsychicApp('howyadoin', {
      websockets: true,
      workers: false,
      client: 'api-only',
      primaryKeyType: 'bigserial',
    })

    await expectNoFile('howyadoin/src/conf/workers.ts')
    await expectFile('howyadoin/src/conf/websockets.ts')

    await expectToMatchFixture(
      'expected-files/initializePsychicApplication/no-workers-yes-websockets.ts',
      await readFile('howyadoin/src/cli/helpers/initializePsychicApplication.ts')
    )

    await expectToMatchFixture(
      'expected-files/app/no-workers.ts',
      await readFile('howyadoin/src/conf/app.ts')
    )
  })
})
