import { env } from 'psychic'
// import '../../../src/helpers/loadEnv'
// import * as devServer from 'jest-dev-server'

env.load()

export default async function () {
  // await devServer.setup({
  //   command: 'yarn spec-server',
  //   launchTimeout: 10000,
  //   debug: process.env.DEBUG === '1',
  //   port: 7778,
  // })
}
