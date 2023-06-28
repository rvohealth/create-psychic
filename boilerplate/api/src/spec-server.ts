import './conf/loadEnv'
import { PsychicServer } from 'psychic'

process.env.NODE_ENV = 'test'

const server = new PsychicServer()
server.start(parseInt(process.env.DEV_SERVER_PORT || '7778'))
