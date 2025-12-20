import sspawn from '../../../../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../../../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../../../../helpers/assertions/expectNoWorkers.js'
import temporarilyDisableEslintForNextjsBuild from '../../../../../helpers/init/temporarilyDisableEslintForNextjsBuild.js'
import initPsychicAppDefaults from '../../../../../helpers/initPsychicAppDefaults.js'
import initSpecPsychicApp from '../../../../../helpers/initSpecPsychicApp.js'

describe('initPsychicApp with --template=nextjs flag and dreamOnly: true', () => {
  it('initializes an app configured with npm specifically for nextjs', async () => {
    await initSpecPsychicApp('howyadoin', {
      ...initPsychicAppDefaults(),
      packageManager: 'npm',
      template: 'nextjs',
      importExtension: 'none',
      dreamOnly: true,
    })

    await expectNoWorkers()
    await expectNoWebsockets()

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
