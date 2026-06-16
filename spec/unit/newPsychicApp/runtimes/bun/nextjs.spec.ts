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
// scaffold path and needs its own spec. nextjs covers the `bunx create-next-app
// --use-bun` path and the `bun run --cwd=../client` wrapper.
describe.skipIf(!bunAvailable())('newPsychicApp with a bun runtime and a nextjs client', () => {
  it('provisions a nextjs client with bun and runs its specs through bun', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'bun',
      runtime: 'bun',
      websockets: false,
      claudePsychicSkill: false,
      codexPsychicSkill: false,
      workers: false,
      client: 'nextjs',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    // Bun api gets bunfig.toml + bun.lock.
    await expectFile('./howyadoin/api/bunfig.toml')
    await expectFile('./howyadoin/api/bun.lock')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    // verify next.config.ts has distDir for fspec build separation
    const nextConfig = fs.readFileSync('./howyadoin/client/next.config.ts').toString()
    expect(nextConfig).toContain('distDir: process.env.NEXT_DIST_DIR ?? ".next"')

    // verify .gitignore includes .next-fspec
    const gitignore = fs.readFileSync('./howyadoin/client/.gitignore').toString()
    expect(gitignore).toContain('.next-fspec')

    // The api wrapper script must drive the client with bun (`bun run --cwd`).
    await expectFileToContain('./howyadoin/api/package.json', 'bun run --cwd=../client next dev')

    await sspawn(
      `\
        cd howyadoin/api &&
        bun run uspec &&
        bun run fspec`,
    )
  }, 300_000)
})
