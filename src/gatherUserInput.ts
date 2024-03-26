import * as readline from 'readline'
import { input, select } from '@inquirer/prompts'

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
  const answer = await select({
    message: 'redis?',
    choices: [
      {
        name: 'y',
        value: true,
        // description: 'npm is the most popular package manager',
      },
      {
        name: 'n',
        value: false,
      },
    ],
  })
  options.redis = answer
}

async function wsQuestion() {
  const answer = await select({
    message: 'websockets?',
    choices: [
      {
        name: 'y',
        value: true,
        // description: 'npm is the most popular package manager',
      },
      {
        name: 'n',
        value: false,
      },
    ],
  })
  options.ws = answer
}

async function primaryKeyTypeQuestion() {
  const answer = await select({
    message: 'primary key type?',
    choices: [
      {
        name: 'integer',
        value: 'integer',
        // description: 'npm is the most popular package manager',
      },
      {
        name: 'uuid',
        value: 'uuid',
      },
    ],
  })
  options.useUuids = answer === 'uuid'
}

async function clientQuestion() {
  if (options.apiOnly) return

  const answer = await select({
    message: 'which front end client would you like to use?',
    choices: [
      {
        name: 'react',
        value: 'react',
        description: 'use a react app with typescript and redux',
      },
      {
        name: 'vue',
        value: 'vue',
        description: 'use a vue app with typescript',
      },
      {
        name: 'nuxt',
        value: 'nuxt',
        description: 'use a nuxt app with vue and typescript',
      },
      {
        name: 'api only',
        value: null,
        description: 'do not create a front end client, only an api server',
      },
    ],
  })

  if (!answer) {
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
