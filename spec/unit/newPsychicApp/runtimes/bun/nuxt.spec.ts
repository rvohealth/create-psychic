import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

// This integration spec generates + installs + boots a real Bun app, so it only
// runs where the `bun` CLI is present. Environments without it (incl. CI runners
// that don't set up bun) skip it. To exercise it in CI, add oven-sh/setup-bun to
// the unit-test job.
function bunAvailable(): boolean {
  try {
    execSync('bun --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Bun drives its own front ends, so each client type goes through a distinct bun
// scaffold path and needs its own spec. nuxt covers the `bunx nuxi init` path and
// the `bun run --cwd=../client dev` wrapper.
describe.skipIf(!bunAvailable())('newPsychicApp with a bun runtime and a nuxt client', () => {
  it('provisions a nuxt client with bun and runs its specs through bun', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'bun',
      runtime: 'bun',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'nuxt',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/bunfig.toml')
    await expectFile('./howyadoin/api/bun.lock')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    // verify nuxt.config.ts has buildDir for fspec build separation
    const nuxtConfig = fs.readFileSync('./howyadoin/client/nuxt.config.ts').toString()
    expect(nuxtConfig).toContain('buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt"')

    // verify .gitignore includes .nuxt-fspec
    const gitignore = fs.readFileSync('./howyadoin/client/.gitignore').toString()
    expect(gitignore).toContain('.nuxt-fspec')

    // The api wrapper script must drive the client with bun (`bun run --cwd`).
    await expectFileToContain('./howyadoin/api/package.json', 'bun run --cwd=../client dev')

    // Nuxt's dev server (vite-node) opens a unix socket under TMPDIR. macOS's
    // default TMPDIR (/var/folders/…) plus Nuxt's ~61-char socket subpath exceeds
    // the 104-byte sun_path limit, so the client dev server 500s on macOS dev
    // machines (CI's Linux /tmp is short and unaffected). Pin a short TMPDIR so the
    // feature spec's client server boots everywhere. This is an upstream
    // Nuxt-on-macOS limitation, not a generator concern.
    await sspawn(
      `\
        export TMPDIR=/tmp &&
        cd howyadoin/api &&
        bun run uspec &&
        bun run fspec`,
    )
  }, 300_000)
})
