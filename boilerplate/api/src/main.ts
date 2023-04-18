import './.psy/init'
import { env, PsychicServer } from 'psychic'

env.load()

const server = new PsychicServer()
server.start()
