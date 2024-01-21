import 'expect-puppeteer'
import * as dotenv from 'dotenv'
import { truncate } from '@rvohealth/dream/spec-helpers'

dotenv.config({ path: '.env.test' })

beforeEach(async () => {
  await truncate()
})
