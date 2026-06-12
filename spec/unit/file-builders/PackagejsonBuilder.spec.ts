/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import PackagejsonBuilder from '../../../src/file-builders/PackagejsonBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

describe('PackagejsonBuilder', () => {
  const baseOptions: NewPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    claudePsychicSkill: false,
    codexPsychicSkill: false,
    client: 'none',
    adminClient: 'none',
    internalClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.buildAPI', () => {
    it('captures appName', async () => {
      const res = await PackagejsonBuilder.buildAPI('howyadoin', baseOptions)
      expect(JSON.parse(res).name).toEqual('howyadoin')
    })

    it('pins engines.node to the Psychic security target (>=26)', async () => {
      const res = await PackagejsonBuilder.buildAPI('howyadoin', baseOptions)
      expect(JSON.parse(res).engines).toEqual({ node: '>=26' })
    })

    context('with backgroundWorkers: false and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@koa/cors',
            '@koa/etag',
            '@koa/router',
            '@rvoh/dream',
            '@rvoh/psychic',
            'commander',
            'koa-bodyparser',
            'koa-conditional-get',
            'koa',
            'kysely',
            'openapi-typescript',
            'pg',
            'winston',
          ]),
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(
          expect.arrayContaining([
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'bullmq',
            'ioredis',
            'socket.io-adapter',
            'socket.io',
          ]),
        )

        expect(JSON.parse(res).scripts['client']).toBeUndefined()
        expect(JSON.parse(res).scripts['client:fspec']).toBeUndefined()
      })
    })

    context('nextjs client (yarn)', () => {
      it('includes client scripts using next binary directly', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nextjs' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('yarn --cwd=../client next dev --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_PUBLIC_API_URL=http://localhost:7778 NEXT_DIST_DIR=.next-fspec yarn --cwd=../client next dev --port 3050',
        )
      })
    })

    context('nextjs client (npm)', () => {
      it('includes client scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nextjs', packageManager: 'npm' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('npm run --prefix=../client dev -- --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_PUBLIC_API_URL=http://localhost:7778 NEXT_DIST_DIR=.next-fspec npm run --prefix=../client dev -- --port 3050',
        )
      })
    })

    context('nuxt client (yarn)', () => {
      it('includes client scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nuxt' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('yarn --cwd=../client dev --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec yarn --cwd=../client dev --port 3050',
        )
      })
    })

    context('nuxt client (npm)', () => {
      it('includes client scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nuxt', packageManager: 'npm' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('npm run --prefix=../client dev -- --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec npm run --prefix=../client dev -- --port 3050',
        )
      })
    })

    context('react client (yarn)', () => {
      it('includes client scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('yarn --cwd=../client dev --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../client dev --port 3050',
        )
      })
    })

    context('react client (npm)', () => {
      it('includes client scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react', packageManager: 'npm' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('npm run --prefix=../client dev -- --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test npm run --prefix=../client dev -- --port 3050',
        )
      })
    })

    context('nextjs adminClient (yarn)', () => {
      it('includes admin scripts using next binary directly', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'nextjs' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('yarn --cwd=../admin next dev --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec yarn --cwd=../admin next dev --port 3051',
        )
      })
    })

    context('nextjs adminClient (npm)', () => {
      it('includes admin scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          adminClient: 'nextjs',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('npm run --prefix=../admin dev -- --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec npm run --prefix=../admin dev -- --port 3051',
        )
      })
    })

    context('nuxt adminClient (yarn)', () => {
      it('includes admin scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'nuxt' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('yarn --cwd=../admin dev --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec yarn --cwd=../admin dev --port 3051',
        )
      })
    })

    context('nuxt adminClient (npm)', () => {
      it('includes admin scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          adminClient: 'nuxt',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('npm run --prefix=../admin dev -- --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec npm run --prefix=../admin dev -- --port 3051',
        )
      })
    })

    context('react adminClient (yarn)', () => {
      it('includes admin scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'react' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('yarn --cwd=../admin dev --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../admin dev --port 3051',
        )
      })
    })

    context('react adminClient (npm)', () => {
      it('includes admin scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          adminClient: 'react',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('npm run --prefix=../admin dev -- --port 3001')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test npm run --prefix=../admin dev -- --port 3051',
        )
      })
    })

    context('nextjs internalClient (yarn)', () => {
      it('includes internal scripts using next binary directly', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, internalClient: 'nextjs' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('yarn --cwd=../internal next dev --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec yarn --cwd=../internal next dev --port 3052',
        )
      })
    })

    context('nextjs internalClient (npm)', () => {
      it('includes internal scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          internalClient: 'nextjs',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('npm run --prefix=../internal dev -- --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec npm run --prefix=../internal dev -- --port 3052',
        )
      })
    })

    context('nuxt internalClient (yarn)', () => {
      it('includes internal scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, internalClient: 'nuxt' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('yarn --cwd=../internal dev --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec yarn --cwd=../internal dev --port 3052',
        )
      })
    })

    context('nuxt internalClient (npm)', () => {
      it('includes internal scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          internalClient: 'nuxt',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('npm run --prefix=../internal dev -- --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none NUXT_BUILD_DIR=.nuxt-fspec npm run --prefix=../internal dev -- --port 3052',
        )
      })
    })

    context('react internalClient (yarn)', () => {
      it('includes internal scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, internalClient: 'react' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('yarn --cwd=../internal dev --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../internal dev --port 3052',
        )
      })
    })

    context('react internalClient (npm)', () => {
      it('includes internal scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = {
          ...baseOptions,
          internalClient: 'react',
          packageManager: 'npm',
        }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['internal']).toEqual('npm run --prefix=../internal dev -- --port 3002')
        expect(JSON.parse(res).scripts['internal:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test npm run --prefix=../internal dev -- --port 3052',
        )
      })
    })

    context('backgroundWorkers: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@koa/cors',
            '@koa/etag',
            '@koa/router',
            '@rvoh/dream',
            '@rvoh/psychic-workers',
            '@rvoh/psychic',
            'bullmq',
            'commander',
            'ioredis',
            'koa-bodyparser',
            'koa-conditional-get',
            'koa',
            'kysely',
            'openapi-typescript',
            'pg',
            'winston',
          ]),
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(
          expect.arrayContaining([
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'socket.io',
            'socket.io-adapter',
          ]),
        )
      })
    })

    context('ws: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, websockets: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@koa/cors',
            '@koa/etag',
            '@koa/router',
            '@rvoh/dream',
            '@rvoh/psychic-websockets',
            '@rvoh/psychic',
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'commander',
            'ioredis',
            'koa-bodyparser',
            'koa-conditional-get',
            'koa',
            'kysely',
            'openapi-typescript',
            'pg',
            'socket.io-adapter',
            'socket.io',
            'winston',
          ]),
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(expect.arrayContaining(['bullmq']))
      })
    })

    context('ws: true and bgWorkers: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true, websockets: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@koa/cors',
            '@koa/etag',
            '@koa/router',
            '@rvoh/dream',
            '@rvoh/psychic-websockets',
            '@rvoh/psychic-workers',
            '@rvoh/psychic',
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'bullmq',
            'commander',
            'ioredis',
            'koa-bodyparser',
            'koa-conditional-get',
            'koa',
            'kysely',
            'openapi-typescript',
            'pg',
            'socket.io-adapter',
            'socket.io',
            'winston',
          ]),
        )
      })
    })

    context('dependency overrides', () => {
      it('keeps only `overrides` for npm', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', { ...baseOptions, packageManager: 'npm' })
        const parsed = JSON.parse(res) as Record<string, unknown>
        expect(parsed.overrides).toEqual({ 'path-to-regexp': '>=8.4.0' })
        expect(parsed.resolutions).toBeUndefined()
        expect(parsed.pnpm).toBeUndefined()
      })

      it('keeps only `resolutions` for yarn', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', { ...baseOptions, packageManager: 'yarn' })
        const parsed = JSON.parse(res) as Record<string, unknown>
        expect(parsed.resolutions).toEqual({ 'path-to-regexp': '>=8.4.0' })
        expect(parsed.overrides).toBeUndefined()
        expect(parsed.pnpm).toBeUndefined()
      })

      it('strips all override fields for pnpm (overrides live in pnpm-workspace.yaml)', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', { ...baseOptions, packageManager: 'pnpm' })
        const parsed = JSON.parse(res) as Record<string, unknown>
        expect(parsed.pnpm).toBeUndefined()
        expect(parsed.overrides).toBeUndefined()
        expect(parsed.resolutions).toBeUndefined()
      })

      it('keeps `overrides` for bun (bun reads npm-style overrides)', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', {
          ...baseOptions,
          packageManager: 'bun',
          runtime: 'bun',
        })
        const parsed = JSON.parse(res) as Record<string, unknown>
        expect(parsed.overrides).toEqual({ 'path-to-regexp': '>=8.4.0' })
        expect(parsed.resolutions).toBeUndefined()
        expect(parsed.pnpm).toBeUndefined()
      })

      it('strips all override fields for deno (it honors neither overrides nor resolutions)', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', {
          ...baseOptions,
          packageManager: 'deno',
          runtime: 'deno',
        })
        const parsed = JSON.parse(res) as Record<string, unknown>
        expect(parsed.overrides).toBeUndefined()
        expect(parsed.resolutions).toBeUndefined()
        expect(parsed.pnpm).toBeUndefined()
      })
    })

    context('deno runtime scripts', () => {
      it('runs entrypoints/specs/builds under deno with no Node-toolchain runners', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', {
          ...baseOptions,
          packageManager: 'deno',
          runtime: 'deno',
          workers: true,
          websockets: true,
        })
        const scripts = JSON.parse(res).scripts as Record<string, string>
        expect(scripts['psy']).toBe('deno run -A src/conf/system/cli.ts')
        expect(scripts['uspec']).toContain('deno task psy db:integrity-check')
        expect(scripts['uspec']).toContain('deno run -A npm:vitest')
        expect(scripts['worker:dev']).toContain('deno run -A ./src/worker.ts')
        expect(scripts['web:dev']).toContain('deno run -A --watch src/main.ts')
        expect(scripts['build']).toContain('deno run -A npm:typescript/tsc')

        const all = Object.values(scripts).join('\n')
        expect(all).not.toMatch(/\btsx /)
        expect(all).not.toMatch(/\bnodemon\b/)
      })
    })

    context('bun runtime scripts', () => {
      it('runs entrypoints/specs/builds under bun with no Node-toolchain runners', async () => {
        const res = await PackagejsonBuilder.buildAPI('howyadoin', {
          ...baseOptions,
          packageManager: 'bun',
          runtime: 'bun',
          workers: true,
          websockets: true,
        })
        const scripts = JSON.parse(res).scripts as Record<string, string>
        // Bun entrypoints carry --no-env-file so Bun's auto-loading of `.env`
        // does not pre-empt src/conf/loadEnv.ts (which expects the node/tsx
        // model where nothing pre-loads env). See applyRuntimeRunners.
        expect(scripts['psy']).toBe('bun --no-env-file src/conf/system/cli.ts')
        expect(scripts['uspec']).toContain('bun run psy db:integrity-check')
        // Spec runners pin NODE_ENV=test so Bun auto-loads `.env.test` (matching
        // loadEnv) instead of `.env`; `--no-env-file` can't reach them via bunx.
        expect(scripts['uspec']).toContain('NODE_ENV=test bunx vitest')
        expect(scripts['fspec']).toContain('NODE_ENV=test bunx vitest')
        expect(scripts['fspec:visible']).toContain('NODE_ENV=test bunx vitest run')
        expect(scripts['uspec:js']).toContain('NODE_ENV=test bunx vitest')
        expect(scripts['fspec:js']).toContain('NODE_ENV=test bunx vitest')
        expect(scripts['worker:dev']).toContain('bun --no-env-file ./src/worker.ts')
        expect(scripts['web:dev']).toContain('bun --no-env-file --watch src/main.ts')
        expect(scripts['build']).toContain('bunx tsc')

        const all = Object.values(scripts).join('\n')
        expect(all).not.toMatch(/\btsx /)
        expect(all).not.toMatch(/\bnodemon\b/)
      })
    })
  })
})
