import CiWorkflowBuilder from '../../../src/file-builders/CiWorkflowBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

const baseOptions: NewPsychicAppCliOptions = {
  packageManager: 'pnpm',
  workers: false,
  websockets: false,
  claudePsychicSkill: false,
  codexPsychicSkill: false,
  client: 'none',
  adminClient: 'none',
  internalClient: 'none',
  primaryKeyType: 'bigserial',
}

describe('CiWorkflowBuilder', () => {
  describe('.build', () => {
    context('security hardening (pnpm, api-only)', () => {
      const yml = CiWorkflowBuilder.build('howyadoin', baseOptions)

      it('locks the workflow token to least privilege', () => {
        expect(yml).toContain('permissions:\n  contents: read')
      })

      it('pins every action to an immutable commit SHA, never a bare tag', () => {
        expect(yml).toContain('actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10')
        expect(yml).toContain('actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e')
        expect(yml).toContain('actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a')
        // No `uses:` line may reference a mutable @vN tag (SHA pins only; version
        // numbers appear only in trailing comments).
        const usesTags = yml.match(/uses: [^\n]*@v\d+(\.\d+)*(\s|$)/g)
        expect(usesTags).toBeNull()
      })

      it('installs with a frozen lockfile', () => {
        expect(yml).toContain('pnpm install --frozen-lockfile')
      })

      it('runs CI on the Node version the app targets', () => {
        expect(yml).toContain('node-version: "26"')
      })

      it('defaults to a single safe shard (a fresh app has too few spec files to split)', () => {
        expect(yml).toContain('shard: ["1/1"]')
      })

      it('runs uspec, fspec, and the sequential checks job', () => {
        expect(yml).toContain('pnpm uspec --shard=${{ matrix.shard }}')
        expect(yml).toContain('pnpm fspec --shard=${{ matrix.shard }}')
        expect(yml).toContain('pnpm build:spec')
        expect(yml).toContain('pnpm lint')
        expect(yml).toContain('pnpm psy diff:openapi')
        expect(yml).toContain('pnpm psy check:controller-hierarchy')
      })

      it('gives diff:openapi git history + oasdiff', () => {
        expect(yml).toContain('fetch-depth: 0')
        expect(yml).toContain('oasdiff')
        expect(yml).toContain('actions/setup-go@')
      })

      it('does not commit production secrets — only throwaway test keys', () => {
        expect(yml).toContain('APP_ENCRYPTION_KEY:')
        expect(yml).toContain('TEST-ONLY')
      })
    })

    context('api-only vs monorepo working directory', () => {
      it('runs from . when api-only', () => {
        expect(CiWorkflowBuilder.build('howyadoin', baseOptions)).toContain('working-directory: .\n')
      })

      it('runs from ./api and installs each client when a monorepo', () => {
        const yml = CiWorkflowBuilder.build('howyadoin', {
          ...baseOptions,
          client: 'react',
          adminClient: 'react',
          internalClient: 'none',
        })
        expect(yml).toContain('working-directory: ./api')
        expect(yml).toContain('working-directory: ./client')
        expect(yml).toContain('working-directory: ./admin')
        expect(yml).not.toContain('working-directory: ./internal')
      })
    })

    context('services', () => {
      it('provisions postgres only when there are no workers/websockets', () => {
        const yml = CiWorkflowBuilder.build('howyadoin', baseOptions)
        expect(yml).toContain('postgres:')
        expect(yml).not.toContain('redis:')
      })

      it('adds redis when workers or websockets are enabled', () => {
        expect(CiWorkflowBuilder.build('howyadoin', { ...baseOptions, workers: true })).toContain('redis:')
        expect(CiWorkflowBuilder.build('howyadoin', { ...baseOptions, websockets: true })).toContain('redis:')
      })

      it('uses Postgres 18 for uuid7 primary keys, 16 otherwise', () => {
        expect(CiWorkflowBuilder.build('howyadoin', { ...baseOptions, primaryKeyType: 'uuid7' })).toContain(
          'image: postgres:18',
        )
        expect(CiWorkflowBuilder.build('howyadoin', baseOptions)).toContain('image: postgres:16')
      })
    })

    context('npm flag forwarding', () => {
      const yml = CiWorkflowBuilder.build('howyadoin', { ...baseOptions, packageManager: 'npm' })

      it('installs with npm ci and no corepack step', () => {
        expect(yml).toContain('npm ci')
        expect(yml).not.toContain('corepack enable')
      })

      it('forwards flags to scripts and psy commands via --', () => {
        expect(yml).toContain('npm run uspec -- --shard=${{ matrix.shard }}')
        expect(yml).toContain('npm run psy db:migrate -- --skip-sync')
        expect(yml).toContain('npm run psy diff:openapi')
        expect(yml).toContain('npm run psy check:controller-hierarchy')
      })
    })

    context('yarn', () => {
      it('installs with an immutable lockfile via corepack', () => {
        const yml = CiWorkflowBuilder.build('howyadoin', { ...baseOptions, packageManager: 'yarn' })
        expect(yml).toContain('corepack enable')
        expect(yml).toContain('yarn install --immutable')
        expect(yml).toContain('yarn uspec --shard=${{ matrix.shard }}')
      })
    })
  })
})
