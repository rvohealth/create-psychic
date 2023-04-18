import { Sequelize } from 'sequelize-typescript'
import { env } from 'howl'
import dbOptions from '../conf/db'

env.load()

const connection = new Sequelize({
  ...dbOptions()[process.env.NODE_ENV || 'development'],
  models: [__dirname + '/../app/models'],
  logging: false,
})

export default connection
