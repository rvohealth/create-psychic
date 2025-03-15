import PackagejsonBuilder from '../../../src/file-builders/PackagejsonBuilder.js'
import { InitPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

describe('PackagejsonBuilder', () => {
  const baseOptions: InitPsychicAppCliOptions = {
    workers: false,
    websockets: false,
    client: 'none',
    adminClient: 'none',
    primaryKeyType: 'bigserial',
  }

  describe('.buildAPI', () => {
    context('with backgroundWorkers: false and ws: false', () => {
      it('returns the app with the specified options', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions }
        const res = await PackagejsonBuilder.buildAPI(options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-openapi-validator',
            'express-winston',
            'kysely',
            'luxon',
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
      })
    })

    context('backgroundWorkers: true', () => {
      it('adds worker dependencies', async () => {
        const options: InitPsychicAppCliOptions = { ...baseOptions, workers: true }
        const res = await PackagejsonBuilder.buildAPI(options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/psychic-workers',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-openapi-validator',
            'express-winston',
            'kysely',
            'luxon',
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
        const options: InitPsychicAppCliOptions = { ...baseOptions, websockets: true }
        const res = await PackagejsonBuilder.buildAPI(options)

        expect(Object.keys(JSON.parse(res).dependencies)).toEqual(
          expect.arrayContaining([
            '@rvoh/psychic',
            '@rvoh/psychic-websockets',
            '@rvoh/dream',
            'pg',
            'winston',
            'commander',
            'express',
            'express-openapi-validator',
            'express-winston',
            'kysely',
            'luxon',
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
        const options: InitPsychicAppCliOptions = { ...baseOptions, workers: true, websockets: true }
        const res = await PackagejsonBuilder.buildAPI(options)

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
            'express-openapi-validator',
            'express-winston',
            'kysely',
            'luxon',
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
