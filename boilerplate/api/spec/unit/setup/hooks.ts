import '../../../src/conf/loadEnv'
import 'psychic/spec-helpers'
import 'expect-puppeteer'
import truncate from '../../helpers/truncate'

beforeEach(async () => {
  await truncate()
})
