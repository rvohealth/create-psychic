import sspawn from '../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../helpers/assertions/expectNoWorkers.js'
import expectNoFile from '../../helpers/expectNoFile.js'
import expectToMatchFixture from '../../helpers/expectToMatchFixture.js'
import temporarilyDisableEslintForNextjsBuild from '../../helpers/init/temporarilyDisableEslintForNextjsBuild.js'
import initPsychicAppDefaults from '../../helpers/initPsychicAppDefaults.js'
import initSpecPsychicApp from '../../helpers/initSpecPsychicApp.js'
import readFile from '../../helpers/readFile.js'

describe('initPsychicApp with --dream-only flag', () => {
  it('initializes an app without psychic bindings', async () => {
    await initSpecPsychicApp('howyadoin', {
      ...initPsychicAppDefaults(),
      dreamOnly: true,
    })

    await expectNoWorkers()
    await expectNoWebsockets()

    await expectNoFile('howyadoin/src/api/conf/app.ts')
    await expectToMatchFixture(
      'expected-files/dream/init/basic.ts',
      await readFile('howyadoin/src/api/conf/dream.ts'),
    )
    await expectToMatchFixture(
      'expected-files/cli/dream-only.ts',
      await readFile('howyadoin/src/api/conf/system/cli.ts'),
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
