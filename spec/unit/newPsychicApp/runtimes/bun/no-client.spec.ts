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
      primaryKeyType: 'bigserial',
    })

    // Bun gets bunfig.toml; .nvmrc (node-only) and deno.json are not emitted.
    await expectFile('./howyadoin/bunfig.toml')
    await expectFile('./howyadoin/bun.lock')
    await expectFileToContain('./howyadoin/bunfig.toml', 'registry = "https://registry.npmjs.org"')
    expect(fs.existsSync('./howyadoin/.nvmrc')).toBe(false)
    expect(fs.existsSync('./howyadoin/deno.json')).toBe(false)

    await expectFileToContain('./howyadoin/src/conf/app.ts', "psy.set('packageManager', 'bun')")

    // No Node-only vestiges: nodemon.json is dead config under Bun (web:dev uses
    // `bun --no-env-file --watch`), and nodemon/tsx/engines.node don't belong in a Bun app.
    expect(fs.existsSync('./howyadoin/nodemon.json')).toBe(false)
    const pkg = JSON.parse(fs.readFileSync('./howyadoin/package.json').toString()) as {
      devDependencies: Record<string, string>
      engines?: unknown
    }
    expect(pkg.devDependencies.nodemon).toBeUndefined()
    expect(pkg.devDependencies.tsx).toBeUndefined()
    expect(pkg.engines).toBeUndefined()

    await sspawn(`cd howyadoin && bun run uspec`)
  }, 300_000)
})
