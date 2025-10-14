import * as dotenv from 'dotenv'
import AppEnv from './AppEnv.js'

dotenv.config({ path: AppEnv.isTest ? '.env.test' : '.env' })
