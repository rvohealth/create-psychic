import './.howl/init'
import { env, HowlServer } from 'howl'

env.load()

const server = new HowlServer()
server.start()
