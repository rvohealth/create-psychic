import 'expect-puppeteer'
import * as dotenv from 'dotenv'
import { truncate } from 'dream/spec-helpers'

dotenv.config({ path: '.env.test' })

beforeEach(async () => {
  await truncate()
})
