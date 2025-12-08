import sspawn from '../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../helpers/assertions/expectNoWorkers.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import temporarilyDisableEslintForNextjsBuild from '../../helpers/init/temporarilyDisableEslintForNextjsBuild.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'
import initSpecPsychicApp from '../../helpers/initSpecPsychicApp.js'
import readFile from '../../helpers/readFile.js'

describe('initPsychicApp without websockets or background jobs', () => {
  it('initializes an app without websockets or background configurations', async () => {
    await initSpecPsychicApp('howyadoin', initPsychicAppDefaults())

    await expectNoWorkers()
    await expectNoWebsockets()

    await expectToMatchFixture(
      'expected-files/app/init/basic.ts',
      await readFile('howyadoin/src/api/conf/app.ts'),
    )

    // nextjs has different eslint rules than psychic, so we
    // will temporarily swap out their next.confg.ts for a file
    // that disables eslint during build, then run build to make
    // sure there are no non-eslint errors, then swap it back
    // to the original config when we are done.
    await temporarilyDisableEslintForNextjsBuild(async () => {
      await sspawn(
        `\
        cd howyadoin &&
        npm run build`,
      )
    })
  }, 120_000)
})
