import { PsychicServer } from 'psychic'
import * as request from 'supertest'
const server = new PsychicServer()

describe('a visitor attempts to hit an unauthed route', () => {
  beforeAll(async () => {
    await server.boot()
  })

  it('accepts the request', async () => {
    request.agent(server.app).get('/ping').expect(200)
  })
})
