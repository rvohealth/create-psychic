import 'expect-puppeteer'
import { env } from 'psychic'
import truncate from '../../helpers/truncate'

env.load()

beforeEach(async () => {
  await truncate()
})
