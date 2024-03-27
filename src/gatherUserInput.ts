import * as readline from 'readline'
import Select from './select'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const options: NewAppCLIOptions = {
  apiOnly: false,
  redis: false,
  ws: false,
  useUuids: false,
  client: null,
}

export interface NewAppCLIOptions {
  apiOnly: boolean
  redis: boolean
  ws: boolean
  useUuids: boolean
  client: FrontEndClientType
}

export type FrontEndClientType = 'react' | 'vue' | 'nuxt' | null

async function redisQuestion() {
  const answer = await new Select('redis?', ['yes', 'no'] as const).run()
  options.redis = answer === 'yes'
}

async function wsQuestion() {
  const answer = await new Select('websockets?', ['yes', 'no'] as const).run()
  options.ws = answer === 'yes'
}

async function primaryKeyTypeQuestion() {
  const answer = await new Select('what primary key type would you like to use?', [
    'integer',
    'uuid',
  ] as const).run()
  options.useUuids = answer === 'uuid'
}

async function clientQuestion() {
  if (options.apiOnly) return

  const answer = await new Select('which front end client would you like to use?', [
    'react',
    'vue',
    'nuxt',
    'none (api only)',
  ] as const).run()

  if (answer === 'none (api only)') {
    options.apiOnly = true
  } else {
    options.client = answer as FrontEndClientType
  }
}

export default async function gatherUserInput() {
  await redisQuestion()
  await wsQuestion()
  await clientQuestion()
  await primaryKeyTypeQuestion()

  return options
}
