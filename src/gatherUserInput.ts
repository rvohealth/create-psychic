import * as readline from 'readline'
import prompts from 'prompts'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const options: NewAppCLIOptions = {
  apiOnly: false,
  redis: false,
  ws: false,
  useUuids: false,
  client: 'react',
}

export interface NewAppCLIOptions {
  apiOnly: boolean
  redis: boolean
  ws: boolean
  useUuids: boolean
  client: FrontEndClientType
}

export type FrontEndClientType = 'react' | 'vue' | 'nuxt'

async function apiOnlyQuestion() {
  const answer = await prompts([
    {
      type: 'multiselect',
      name: 'apiOnly',
      message: 'api only?',
      instructions: false,
      choices: [
        { title: 'y', value: true },
        { title: 'f', value: false },
      ],
    },
  ])
  options.apiOnly = answer.apiOnly
}

async function redisQuestion() {
  const answer = await prompts([
    {
      type: 'multiselect',
      name: 'redis',
      message: 'redis?',
      instructions: false,
      choices: [
        { title: 'y', value: true },
        { title: 'f', value: false },
      ],
    },
  ])
  options.redis = answer.redis
}

async function wsQuestion() {
  const answer = await prompts([
    {
      type: 'multiselect',
      name: 'websockets',
      message: 'websockets?',
      instructions: false,
      choices: [
        { title: 'y', value: true },
        { title: 'f', value: false },
      ],
    },
  ])

  options.ws = answer.websockets
}

async function primaryKeyTypeQuestion() {
  const answer = await prompts([
    {
      type: 'multiselect',
      name: 'primaryKeyType',
      message: 'primary key type?',
      instructions: false,
      choices: [
        { title: 'integer', value: 'integer' },
        { title: 'uuid', value: 'uuid' },
      ],
    },
  ])

  options.useUuids = answer.primaryKeyType === 'uuid'
}

async function clientQuestion() {
  if (options.apiOnly) return

  const answer = await prompts([
    {
      type: 'multiselect',
      name: 'clientFramework',
      message: 'which front end client would you like to use?',
      instructions: false,
      choices: [
        { title: 'redux', value: 'redux' },
        { title: 'vue', value: 'vue' },
        { title: 'nuxt', value: 'nuxt' },
      ],
    },
  ])

  options.client = answer.clientFramework as FrontEndClientType
}

export default async function gatherUserInput() {
  await apiOnlyQuestion()
  await redisQuestion()
  await wsQuestion()
  await clientQuestion()
  await primaryKeyTypeQuestion()
  return options
}
