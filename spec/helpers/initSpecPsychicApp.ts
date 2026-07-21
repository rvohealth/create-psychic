import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import psyCmdForInitOptions from '../../src/helpers/init/psyCmdForInitOptions.js'
import initPsychicApp from '../../src/helpers/initPsychicApp.js'
import { InitPsychicAppCliOptions } from '../../src/helpers/newPsychicApp.js'
import sspawn from '../../src/helpers/sspawn.js'
import ensureNextCompatibleTypescript from '../../src/helpers/ensureNextCompatibleTypescript.js'
import widenNextPinsForCooldown from '../../src/helpers/widenNextPinsForCooldown.js'
import expectFile from './expectFile.js'

export default async function initSpecPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
  await sspawn(
    `npx create-next-app@latest howyadoin --eslint --app --ts --skip-install --use-${options.packageManager} --yes --disable-git --webpack --no-tailwind --src-dir`,
  )

  if (options.packageManager === 'yarn') {
    await prepareYarnFixture('howyadoin')
  }

  // `psy init` injects Psychic into a user's PRE-EXISTING Next app — it never
  // scaffolds Next itself (create-next-app runs only here, to fabricate that
  // stand-in app, and in the `new`-flow client provisioning). The injected
  // boilerplate carries Psychic's supply-chain cooldown (`minimumReleaseAge`).
  // create-next-app exact-pins `next`/`eslint-config-next` to the just-published
  // latest, and an exact pin has no older mature version for the cooldown to
  // fall back to, so the install hard-fails whenever the latest `next` is younger
  // than the cooldown window. A real existing app wouldn't be pinned to a
  // 3-day-old release; widen the fixture's pins to their major range so the
  // cooldown installs the latest MATURE version. This is test-only — Psychic
  // provisions no Next app in the init flow, so nothing users receive changes.
  const packageJsonPath = path.join('howyadoin', 'package.json')
  widenNextPinsForCooldown(packageJsonPath)
  ensureNextCompatibleTypescript(packageJsonPath)

  await initPsychicApp(appName, options)
  await expectFile(path.join('howyadoin', options.confPath, 'dream.ts'))

  const psyOrDreamCmd = psyCmdForInitOptions(options)

  await sspawn(`cd howyadoin &&
  ${psyOrDreamCmd} g:model User email:string &&
  NODE_ENV=test ${psyOrDreamCmd} db:migrate`)
}

async function prepareYarnFixture(appDir: string) {
  await fs.writeFile(
    path.join(appDir, '.yarnrc.yml'),
    'nodeLinker: node-modules\n\nnpmPreapprovedPackages:\n  - "@rvoh/*"\n',
  )
  await sspawn(`cd ${appDir} && touch yarn.lock && corepack enable && yarn set version stable`)
}
