/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import PackagejsonBuilder from '../../../src/file-builders/PackagejsonBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

describe('PackagejsonBuilder', () => {
  const baseOptions: NewPsychicAppCliOptions = {
    packageManager: 'yarn',
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
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
            '@rvoh/psychic',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-winston',
            'kysely',
          ])
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(
          expect.arrayContaining([
            '@bull-board/express',
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'bullmq',
            'ioredis',
            'socket.io',
            'socket.io-adapter',
          ])
        )

        expect(JSON.parse(res).scripts['client']).toBeUndefined()
        expect(JSON.parse(res).scripts['client:fspec']).toBeUndefined()
      })
    })

    context('nextjs client', () => {
      it('includes client scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'nextjs' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('yarn --cwd=../client next dev')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test yarn --cwd=../client next dev'
        )
      })
    })

    context('react client', () => {
      it('includes client scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, client: 'react' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['client']).toEqual('yarn --cwd=../client dev')
        expect(JSON.parse(res).scripts['client:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../client dev'
        )
      })
    })

    context('nextjs adminClient', () => {
      it('includes admin scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'nextjs' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('yarn --cwd=../admin next dev')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none NEXT_PUBLIC_PSYCHIC_ENV=test yarn --cwd=../admin next dev --port 3001'
        )
      })
    })

    context('react adminClient', () => {
      it('includes admin scripts', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, adminClient: 'react' }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)
        expect(JSON.parse(res).scripts['admin']).toEqual('yarn --cwd=../admin dev')
        expect(JSON.parse(res).scripts['admin:fspec']).toEqual(
          'BROWSER=none VITE_PSYCHIC_ENV=test yarn --cwd=../admin dev --port 3001'
        )
      })
    })

    context('backgroundWorkers: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/psychic-workers',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-winston',
            'kysely',
            '@bull-board/express',
            'bullmq',
            'ioredis',
          ])
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(
          expect.arrayContaining([
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'socket.io',
            'socket.io-adapter',
          ])
        )
      })
    })

    context('ws: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, websockets: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/psychic-websockets',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-winston',
            'kysely',
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'socket.io',
            'socket.io-adapter',
            'ioredis',
          ])
        )

        expect(Object.keys(JSON.parse(res).dependencies)).not.toEqual(
          expect.arrayContaining(['@bull-board/express', 'bullmq'])
        )
      })
    })

    context('ws: true and bgWorkers: true', () => {
      it('adds worker dependencies', async () => {
        const options: NewPsychicAppCliOptions = { ...baseOptions, workers: true, websockets: true }
        const res = await PackagejsonBuilder.buildAPI('howyadoin', options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/psychic-websockets',
            '@rvoh/psychic-workers',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-winston',
            'kysely',
            '@socket.io/redis-adapter',
            '@socket.io/redis-emitter',
            'socket.io',
            'socket.io-adapter',
            'ioredis',
            '@bull-board/express',
            'bullmq',
          ])
        )
      })
    })
  })
})
