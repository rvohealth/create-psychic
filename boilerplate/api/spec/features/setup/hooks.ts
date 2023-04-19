import 'expect-puppeteer'
import * as dotenv from 'dotenv'
import truncate from '../../helpers/truncate'

dotenv.config({ path: '.env.test' })

beforeEach(async () => {
  await truncate()
})
