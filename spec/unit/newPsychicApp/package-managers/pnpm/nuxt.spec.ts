import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with nuxt client', () => {
  it('correctly provisions a nuxt client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'nuxt',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/pnpm-lock.yaml')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    // verify nuxt.config.ts has buildDir for fspec build separation
    const nuxtConfig = fs.readFileSync('./howyadoin/client/nuxt.config.ts').toString()
    expect(nuxtConfig).toContain('buildDir: process.env.NUXT_BUILD_DIR ?? ".nuxt"')

    // verify .gitignore includes .nuxt-fspec
    const gitignore = fs.readFileSync('./howyadoin/client/.gitignore').toString()
    expect(gitignore).toContain('.nuxt-fspec')

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
        pnpm uspec &&
        pnpm uspec:js &&
        pnpm fspec &&
        pnpm fspec:js`,
    )
  }, 300_000)
})
