import * as supersession from 'supertest-session'
import { HowlServer } from 'howl'

export default async function login(email: string, password: string) {
  const server = new HowlServer()
  await server.boot()

  const session = supersession('http://localhost:7778')
  await session
    .post('/login')
    .send({
      email,
      password,
    })
    .expect(200)
  return session
}
