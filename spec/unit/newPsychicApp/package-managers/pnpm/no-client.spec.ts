import * as fs from 'node:fs'
import sspawn from '../../../../../src/helpers/sspawn.js'
import expectFile from '../../../../helpers/expectFile.js'
import expectFileToContain from '../../../../helpers/expectFileToContain.js'
import expectToMatchFixture from '../../../../helpers/expectToMatchFixture.js'
import newSpecPsychicApp from '../../../../helpers/newSpecPsychicApp.js'

describe('newPsychicApp with no client', () => {
  it('correctly provisions an api-only app', async () => {
    await newSpecPsychicApp('howyadoin', {
      packageManager: 'pnpm',
      websockets: false,
      claudePsychicSkill: false,
      agentsPsychicSkill: false,
      workers: false,
      client: 'none',
      adminClient: 'none',
      internalClient: 'none',
      primaryKeyType: 'bigint',
    })

    await expectFile('./howyadoin/pnpm-lock.yaml')
    await expectFileToContain('./howyadoin/pnpm-workspace.yaml', 'strictDepBuilds: false')
    // The build-script deps are pre-declared so `pnpm install` (run above) does not
    // mutate the checked-in workspace file with `set this to true or false`
    // placeholders (pnpm/pnpm#11574).
    await expectFileToContain('./howyadoin/pnpm-workspace.yaml', 'allowBuilds:')
    await expectFileToContain('./howyadoin/pnpm-workspace.yaml', 'esbuild: false')
    const workspaceBody = fs
      .readFileSync('./howyadoin/pnpm-workspace.yaml')
      .toString()
      .split('\n')
      .filter(line => !line.trimStart().startsWith('#'))
      .join('\n')
    expect(workspaceBody).not.toContain('set this to true or false')
    expect(workspaceBody).not.toContain('overrides:')
    expect(workspaceBody).toContain("- 'express@4.22.3'")

    const packageJson = JSON.parse(fs.readFileSync('./howyadoin/package.json', 'utf8')) as Record<
      string,
      unknown
    >
    expect(packageJson.overrides).toBeUndefined()
    expect(packageJson.resolutions).toBeUndefined()

    const lockfile = fs.readFileSync('./howyadoin/pnpm-lock.yaml', 'utf8')
    expect(lockfile).toContain('express@4.22.3:')
    expect(lockfile).toContain('js-yaml@4.3.2:')
    expect(lockfile).toContain('path-to-regexp@0.1.13:')
    expect(lockfile).toContain('path-to-regexp@8.4.2:')
    expect(lockfile).toContain('qs@6.16.0:')
    await expectFile('./howyadoin/docker-compose.yml')
    await expectFile('./howyadoin/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/no-client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    await sspawn(
      `\
        cd howyadoin &&
        pnpm audit --audit-level moderate &&
        pnpm uspec &&
        pnpm uspec:js`,
    )
  }, 120_000)
})
