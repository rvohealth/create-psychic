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
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec yarn --cwd=../client next dev --port 3050',
        )
      })
    })

    context('nextjs client (npm)', () => {
      it('includes client scripts using dev script with -- separator', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nextjs', packageManager: 'npm' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('npm run --prefix=../client dev -- --port 3000')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test NEXT_DIST_DIR=.next-fspec npm run --prefix=../client dev -- --port 3050',
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
  })
})
