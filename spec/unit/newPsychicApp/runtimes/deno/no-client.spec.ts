import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with the deno runtime', () => {
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

    // The dotenv alignment must keep Deno to a SINGLE @rvoh/dream copy. Two copies
    // (the pre-fix state) break Dream's model-class-identity check at boot.
    const dreamCopies = fs
      .readdirSync('./howyadoin/node_modules/.deno')
      .filter(entry => entry.startsWith('@rvoh+dream@'))
    expect(dreamCopies).toHaveLength(1)

    // app.ts records the runtime as the package manager (validated by dream's
    // allowed-package-managers enum at boot).
    await expectFileToContain('./howyadoin/src/conf/app.ts', "psy.set('packageManager', 'deno')")

    await sspawn(`cd howyadoin && deno task uspec`)
  }, 300_000)
})
