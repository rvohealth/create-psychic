import * as repl from 'node:repl'
import { HowlModel } from 'howl'

const replServer = repl.start('> ')
export default (async function () {
  // this line needs to change in boilerplate
  const howl = await import('howl')

  replServer.context.Hash = howl.Hash
  replServer.context.Encrypt = howl.Encrypt
  replServer.context.db = howl.db

  await howl.db.initialize()

  const models = (await import('../.howl/models')).default
  Object.values(models).forEach(ModelClass => {
    replServer.context[(ModelClass as typeof HowlModel).modelName] = ModelClass
  })
})()
