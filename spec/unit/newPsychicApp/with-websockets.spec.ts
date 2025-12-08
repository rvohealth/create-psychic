import sspawn from '../../../src/helpers/sspawn.js'
import expectFile from '../../helpers/expectFile.js'
import expectNoFile from '../../helpers/expectNoFile.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../helpers/newSpecPsychicApp.js'
import readFile from '../../helpers/readFile.js'

describe('newPsychicApp with websockets', () => {
  it('builds app without websockets or background configurations', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: true,
      workers: false,
      client: 'none',
      adminClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectNoFile('howyadoin/src/worker.ts')
    await expectNoFile('howyadoin/src/conf/initializers/workers.ts')
    await expectFile('howyadoin/src/conf/initializers/websockets.ts')

    await expectToMatchFixture(
      'expected-files/app/with-websockets.ts',
      await readFile('howyadoin/src/conf/app.ts'),
    )

    await expectToMatchFixture('expected-files/ws/basic.ts', await readFile('howyadoin/src/utils/ws.ts'))

    await sspawn(
      `\
        cd howyadoin &&
        yarn build`,
    )
  }, 120_000)
})
