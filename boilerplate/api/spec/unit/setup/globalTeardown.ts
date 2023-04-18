import 'tsconfig-paths/register'
import '../../../src/.howl/init'
import { db } from 'howl'

export default async function () {
  await db.close()
}

