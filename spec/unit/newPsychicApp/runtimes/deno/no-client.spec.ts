import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
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

describe.skipIf(!denoAvailable())('newPsychicApp with the deno runtime', () => {
  it('provisions, installs, migrates, and specs a Deno api-only app', async () => {
    // Full stack (workers + websockets) pulls every @rvoh package, which is the
    // dependency set where Deno previously forked @rvoh/dream into two copies over
    // a dotenv-range mismatch — so this is also the dedup regression test.
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'deno',
      runtime: 'deno',
      websockets: true,
      claudePsychicSkill: false,
      codexPsychicSkill: false,
      workers: true,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    // Deno gets its own config; .nvmrc (node-only) and bunfig.toml are not emitted.
    await expectFile('./howyadoin/deno.json')
    await expectFile('./howyadoin/deno.lock')
    await expectFileToContain('./howyadoin/deno.json', 'sloppy-imports')
    expect(fs.existsSync('./howyadoin/.nvmrc')).toBe(false)
    expect(fs.existsSync('./howyadoin/bunfig.toml')).toBe(false)

    // Deno apps get .vscode config so editors auto-import the .ts extension (the Deno
    // LSP's native behavior) instead of the .js the built-in TypeScript server adds.
    await expectFileToContain('./howyadoin/.vscode/settings.json', 'deno.enable')
    await expectFileToContain('./howyadoin/.vscode/extensions.json', 'denoland.vscode-deno')
    // ...and those two files are committed (re-included past the .vscode ignore).
    await expectFileToContain('./howyadoin/.gitignore', '!.vscode/settings.json')

    // The dotenv alignment must keep Deno to a SINGLE @rvoh/dream copy. Two copies
    // (the pre-fix state) break Dream's model-class-identity check at boot.
    const dreamCopies = fs
      .readdirSync('./howyadoin/node_modules/.deno')
      .filter(entry => entry.startsWith('@rvoh+dream@'))
    expect(dreamCopies).toHaveLength(1)

    // app.ts records the runtime as the package manager (validated by dream's
    // allowed-package-managers enum at boot).
    await expectFileToContain('./howyadoin/src/conf/app.ts', "psy.set('packageManager', 'deno')")

    // No Node-only vestiges: nodemon.json is dead config under Deno (web:dev uses
    // `deno run -A --watch`), and nodemon/tsx/engines.node don't belong in a Deno app.
    expect(fs.existsSync('./howyadoin/nodemon.json')).toBe(false)
    const pkg = JSON.parse(fs.readFileSync('./howyadoin/package.json').toString()) as {
      devDependencies: Record<string, string>
      engines?: unknown
    }
    expect(pkg.devDependencies.nodemon).toBeUndefined()
    expect(pkg.devDependencies.tsx).toBeUndefined()
    expect(pkg.engines).toBeUndefined()

    await sspawn(`cd howyadoin && deno task uspec`)
  }, 300_000)
})
