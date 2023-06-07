import '../../../src/conf/loadEnv'
import 'psychic/spec-helpers'
import 'expect-puppeteer'
import { truncate } from 'dream/spec-helpers'

beforeEach(async () => {
  await truncate()
})
