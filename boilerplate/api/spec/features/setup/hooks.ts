import 'tsconfig-paths/register'
import 'expect-puppeteer'
import './extensions'
import '../../../src/.howl/init'

import { db } from 'howl'

beforeEach(async () => {
  await db.connect()
  await db.truncate()
})

afterEach(async () => {
  await db.truncate()
})
