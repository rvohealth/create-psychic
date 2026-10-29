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

describe.skipIf(!bunAvailable())('newPsychicApp with the bun runtime', () => {
  it('provisions, installs, migrates, and specs a Bun api-only app', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'bun',
      runtime: 'bun',
      websockets: true,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: true,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    })

    // Bun gets bunfig.toml
    await expectFile('./howyadoin/bunfig.toml')
    await expectFile('./howyadoin/bun.lock')
    await expectFileToContain('./howyadoin/bunfig.toml', 'registry = "https://registry.npmjs.org"')

    await expectFileToContain('./howyadoin/src/conf/app.ts', "psy.set('packageManager', 'bun')")

    // engines.bun says Bun 1.4.0, the first that loads `#` imports from source.
    const pkg = JSON.parse(fs.readFileSync('./howyadoin/package.json').toString()) as { engines?: unknown }
    expect(pkg.engines).toEqual({ bun: '>=1.4.0' })

    // `psy:js --help` boots the built app from dist/, which resolves its `#` imports through
    // dist/package.json
    await sspawn(`cd howyadoin && bun run uspec && bun run build && bun run psy:js --help`)
  }, 300_000)
})
