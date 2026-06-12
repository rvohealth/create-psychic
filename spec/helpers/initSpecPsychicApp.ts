import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import psyCmdForInitOptions from '../../src/helpers/init/psyCmdForInitOptions.js'
import initPsychicApp from '../../src/helpers/initPsychicApp.js'
import { InitPsychicAppCliOptions } from '../../src/helpers/newPsychicApp.js'
import sspawn from '../../src/helpers/sspawn.js'
import expectFile from './expectFile.js'

export default async function initSpecPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
  await sspawn(
    `npx create-next-app@latest howyadoin --eslint --app --ts --skip-install --use-${options.packageManager} --yes --disable-git --webpack --no-tailwind --src-dir`,
  )

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
  await widenFixtureNextPinsForCooldown('howyadoin')

  await initPsychicApp(appName, options)
  await expectFile(path.join('howyadoin', options.confPath, 'dream.ts'))

  const psyOrDreamCmd = psyCmdForInitOptions(options)

  await sspawn(`cd howyadoin &&
  ${psyOrDreamCmd} g:model User email:string &&
  NODE_ENV=test ${psyOrDreamCmd} db:migrate`)
}

// Widen create-next-app's exact `next` / `eslint-config-next` pins (e.g.
// "16.2.9") to their major range ("^16.0.0") so the injected `minimumReleaseAge`
// cooldown can resolve the latest MATURE version instead of failing on a pin
// that points only at a too-fresh release. Caret-ing the exact version would not
// help — "^16.2.9" still excludes the mature "16.2.8".
async function widenFixtureNextPinsForCooldown(appDir: string) {
  const pkgPath = path.join(appDir, 'package.json')
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  for (const section of ['dependencies', 'devDependencies'] as const) {
    for (const name of ['next', 'eslint-config-next']) {
      const version = pkg[section]?.[name]
      if (typeof version !== 'string') continue
      const major = version.replace(/^\D*/, '').split('.')[0]
      if (major) pkg[section]![name] = `^${major}.0.0`
    }
  }

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
