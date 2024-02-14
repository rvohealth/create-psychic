import 'expect-puppeteer'
import * as dotenv from 'dotenv'
import { truncate } from '@rvohealth/dream/spec-helpers'

process.env.APP_ROOT_PATH = process.cwd()
process.env.TS_SAFE = '1'

dotenv.config({ path: '.env.test' })

beforeEach(async () => {
  await truncate()
})
