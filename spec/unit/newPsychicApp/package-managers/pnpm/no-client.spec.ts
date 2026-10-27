import * as fs from 'node:fs'
import internalSrcPath from '../../../../../src/helpers/internalSrcPath.js'
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
    // pnpm 11+ enforces the cooldown only from pnpm-workspace.yaml
    expect(workspaceBody).toMatch(/^minimumReleaseAge: 4320$/m)
    expect(workspaceBody).toContain("- '@rvoh/*'")

    // .npmrc pins the registry only: pnpm 11+ ignores release-age keys there,
    // and always-auth is inert
    const npmrcSettings = fs
      .readFileSync('./howyadoin/.npmrc', 'utf8')
      .split('\n')
      .filter(line => line.trim() !== '' && !line.trimStart().startsWith('#'))
    expect(npmrcSettings).toEqual([
      'registry=https://registry.npmjs.org',
      '@rvoh:registry=https://registry.npmjs.org',
    ])

    const packageJson = JSON.parse(fs.readFileSync('./howyadoin/package.json', 'utf8')) as Record<
      string,
      unknown
    >
    expect(packageJson.overrides).toBeUndefined()
    expect(packageJson.resolutions).toBeUndefined()
    // an older pnpm installs without the cooldown, so pnpm refuses to run it here
    expect(packageJson.engines).toEqual({ node: '>=24', pnpm: '>=10.19.0' })

    const lockfile = fs.readFileSync('./howyadoin/pnpm-lock.yaml', 'utf8')
    expect(lockfile).toContain('express@4.22.3:')
    expect(lockfile).toContain('js-yaml@4.3.2:')
    expect(lockfile).toContain('path-to-regexp@0.1.13:')
    expect(lockfile).toContain('path-to-regexp@8.4.2:')
    // express@4.22.3 pulls in the patched qs; any later 6.x patch/minor is fine
    expect(lockfile).toMatch(/^ {2}qs@6\.(1[6-9]|[2-9]\d)\.\d+:/m)
    await expectFile('./howyadoin/docker-compose.yml')
    await expectFile('./howyadoin/Dockerfile.dev')

    await expectToMatchFixture(
      'expected-files/docker-compose/pnpm/no-client-basic.yml',
      fs.readFileSync('./howyadoin/docker-compose.yml').toString(),
    )

    // the generators write # imports, which package.json `imports` resolves
    await expectFileToContain(
      './howyadoin/src/app/models/User.ts',
      "import ApplicationModel from '#models/ApplicationModel.js'",
    )

    // The app's own lint (ESLint, then `prettier . --check`) passes on the generated template.
    // Generator output need not be Prettier-clean, because the app's `format` script fixes it,
    // so only the files `g:model User` wrote are formatted first: a whole-app `format` would
    // also rewrite a mis-formatted template file before the check could see it. This runs
    // before the locale spec below is copied into the app.
    await sspawn(
      `\
        pnpm prettier --write src/app/models/User.ts src/app/serializers/UserSerializer.ts \
          "src/db/migrations/*-create-user.ts" spec/unit/models/User.spec.ts spec/factories/UserFactory.ts &&
        pnpm lint`,
      { cwd: './howyadoin' },
    )

    // The template's ApplicationController#locale getter needs Psychic and Koa, which
    // create-psychic does not install, so its spec runs in this app (and ships in none):
    // give the app a second supported locale and copy the spec in for the uspec below
    const i18nPath = './howyadoin/src/utils/i18n.ts'
    const i18n = fs.readFileSync(i18nPath, 'utf8')
    expect(i18n).toContain("SUPPORTED_LOCALES = ['en-US']")
    fs.writeFileSync(
      i18nPath,
      i18n.replace("SUPPORTED_LOCALES = ['en-US']", "SUPPORTED_LOCALES = ['en-US', 'es-ES']"),
    )
    fs.mkdirSync('./howyadoin/spec/unit/controllers', { recursive: true })
    fs.copyFileSync(
      internalSrcPath('../spec/fixtures/generated-app-specs/ApplicationController.locale.spec.ts'),
      './howyadoin/spec/unit/controllers/ApplicationController.locale.spec.ts',
    )

    // `psy:js --help` boots the built app's conf graph from dist/ with no database, so it fails
    // unless the built app resolves its # imports through dist/package.json
    await sspawn(
      `\
        cd howyadoin &&
        pnpm audit --audit-level moderate &&
        pnpm uspec &&
        pnpm uspec:js &&
        pnpm build &&
        pnpm psy:js --help`,
    )
    await expectFile('./howyadoin/dist/package.json')
  }, 120_000)
})
