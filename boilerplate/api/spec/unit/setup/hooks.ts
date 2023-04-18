import 'tsconfig-paths/register'
import '../../../src/.howl/init'

import { db } from 'howl'

beforeEach(async () => {
  await db.connect()
  await db.truncate()
})

afterEach(async () => {
  await db.truncate()
})
