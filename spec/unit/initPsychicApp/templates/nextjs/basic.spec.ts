import sspawn from '../../../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../../../helpers/assertions/expectNoWorkers.js'
import expectFile from '../../../../helpers/expectFile.js'
import temporarilyDisableEslintForNextjsBuild from '../../../../helpers/init/temporarilyDisableEslintForNextjsBuild.js'
import initPsychicAppDefaults from '../../../../helpers/initPsychicAppDefaults.js'
import initSpecPsychicApp from '../../../../helpers/initSpecPsychicApp.js'

describe('initPsychicApp with --template=nextjs flag', () => {
  it('initializes an app configured specifically for nextjs', async () => {
    await initSpecPsychicApp('howyadoin', {
      ...initPsychicAppDefaults(),
      template: 'nextjs',
      importExtension: 'none',
    })

    await expectNoWorkers()
    await expectNoWebsockets()

    await expectFile('howyadoin/src/instrumentation.mts')
    await expectFile('howyadoin/src/instrumentation-node.mts')

    // nextjs has different eslint rules than psychic, so we
    // will temporarily swap out their next.confg.ts for a file
    // that disables eslint during build, then run build to make
    // sure there are no non-eslint errors, then swap it back
    // to the original config when we are done.
    await temporarilyDisableEslintForNextjsBuild(async () => {
      await sspawn(
        `\
        cd howyadoin &&
        npm run build`
      )
    })
  }, 120_000)
})
