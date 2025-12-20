import sspawn from '../../../../../../src/helpers/sspawn.js'
import expectNoWebsockets from '../../../../../helpers/assertions/expectNoWebsockets.js'
import expectNoWorkers from '../../../../../helpers/assertions/expectNoWorkers.js'
import expectFile from '../../../../../helpers/expectFile.js'
import temporarilyDisableEslintForNextjsBuild from '../../../../../helpers/init/temporarilyDisableEslintForNextjsBuild.js'
import initPsychicAppDefaults from '../../../../../helpers/initPsychicAppDefaults.js'
import initSpecPsychicApp from '../../../../../helpers/initSpecPsychicApp.js'

describe('initPsychicApp with --template=nextjs flag', () => {
  it('initializes an app configured with pnpm specifically for nextjs', async () => {
    await initSpecPsychicApp('howyadoin', {
      ...initPsychicAppDefaults(),
      packageManager: 'pnpm',
      template: 'nextjs',
      importExtension: 'none',
    })

    await expectNoWorkers()
    await expectNoWebsockets()

    await expectFile('howyadoin/src/instrumentation.mts')
    await expectFile('howyadoin/src/instrumentation-node.mts')

    // swap out the default page.tsx file for one that calls to maybeInitializePsychicApp,
    // which will cause build to fail if anything crashes during psychic initialization.
    // this is temporarily commented out, because it succeeds locally but fails in CI for some
    // mysterious reason.
    //     await fs.writeFile(
    //       'howyadoin/src/app/page.tsx',
    //       `\
    // import styles from "./page.module.css";
    // import maybeInitializePsychicApp from "../api/conf/system/maybeInitializePsychicApp";
    // import User from "../api/app/models/User";

    // export default async function Home() {
    //   await maybeInitializePsychicApp()
    //   const count = await User.count()

    //   return (
    //     <div className={styles.page}>
    //       User count: {count}
    //     </div>
    //   );
    // }
    // `
    //     )

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
