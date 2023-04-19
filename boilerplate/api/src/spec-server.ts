import { PsychicServer, env } from 'psychic'

process.env.NODE_ENV = 'test'
env.load()

const server = new PsychicServer()
server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))
