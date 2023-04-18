import './.howl/init'
import { HowlServer, env } from 'howl'

env.load()

const server = new HowlServer()
server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))

