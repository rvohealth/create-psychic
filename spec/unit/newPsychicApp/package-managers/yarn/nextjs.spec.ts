import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'

describe('newPsychicApp with nextjs client', () => {
  it('correctly provisions a nextjs client', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'yarn',
      websockets: false,
      claudePsychicSkill: false,
      codexPsychicSkill: false,
      workers: false,
      client: 'nextjs',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigserial',
    })

    await expectFile('./howyadoin/api/yarn.lock')
    await expectFile('./howyadoin/api/Dockerfile.dev')
    await expectFile('./howyadoin/client/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/yarn/client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    // verify next.config.ts has distDir for fspec build separation
    const nextConfig = fs.readFileSync('./howyadoin/client/next.config.ts').toString()
    expect(nextConfig).toContain('distDir: process.env.NEXT_DIST_DIR ?? ".next"')

    // verify .gitignore includes .next-fspec
    const gitignore = fs.readFileSync('./howyadoin/client/.gitignore').toString()
    expect(gitignore).toContain('.next-fspec')

    await sspawn(
      `\
        cd howyadoin/api &&
        yarn uspec &&
        yarn uspec:js &&
        yarn fspec &&
        yarn fspec:js`,
    )
  }, 120_000)
})
