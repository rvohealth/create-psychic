import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with the bun runtime', () => {
  it('provisions, installs, migrates, and specs a Bun api-only app', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'bun',
      runtime: 'bun',
      websockets: true,
      claudePsychicSkill: false,
      codexPsychicSkill: false,
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

    await sspawn(`cd howyadoin && bun run uspec`)
  }, 300_000)
})
