import '../.howl/init'
import { env, HowlServer } from 'howl'

(async function() {
  env.load()
  const server = new HowlServer()
  await server.boot()
  server.routes.forEach(route => console.log(route))
  process.exit()
}())

