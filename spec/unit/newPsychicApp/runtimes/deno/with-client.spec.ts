import { execSync } from 'node:child_process'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

// This integration spec generates + installs + boots a real Deno app, so it only
// runs where the `deno` CLI is present. Environments without it (incl. CI runners
// that don't set up deno) skip it. To exercise it in CI, add denoland/setup-deno
// to the unit-test job.
function denoAvailable(): boolean {
  try {
    execSync('deno --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Deno never drives the front end: its clients are scaffolded and run with pnpm
// (frontEndPackageManager maps deno -> pnpm). A single client spec therefore covers
// every Deno client — they differ only in the pnpm-scaffolded front end, which the
// node+pnpm client specs already cover. What's Deno-specific is the wiring proven
// here: a pnpm-driven client whose wrapper script (`pnpm --dir=../client ...`) is
// invoked through `deno task client`.
describe.skipIf(!denoAvailable())('newPsychicApp with a deno api and a pnpm-driven client', () => {
  it('provisions a react client driven by pnpm and runs its specs through deno task', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'deno',
      runtime: 'deno',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'react',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    // Deno api gets its own config + lockfile.
    await expectFile('./howyadoin/api/deno.json')
    await expectFile('./howyadoin/api/deno.lock')

    // The client is a pnpm artifact even under a Deno api.
    await expectFile('./howyadoin/client/Dockerfile.dev')
    await expectFile('./howyadoin/client/pnpm-lock.yaml')
    await expectFileToContain('./howyadoin/client/pnpm-workspace.yaml', 'strictDepBuilds: false')

    // The api wrapper script must drive the client with pnpm (NOT `deno task --cwd`),
    // while api scripts stay on the deno runtime.
    await expectFileToContain('./howyadoin/api/package.json', 'pnpm --dir=../client dev')

    await sspawn(
      `\
        cd howyadoin/api &&
        deno task uspec &&
        deno task fspec`,
    )
  }, 300_000)
})
