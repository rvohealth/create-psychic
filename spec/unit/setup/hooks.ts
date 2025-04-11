// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { provideDreamViteMatchers } from '@rvoh/dream-spec-helpers'
import * as fs from 'node:fs/promises'
import pg from 'pg'
import defaultDbCredentials from '../../../src/helpers/defaultDbCredentials.js'

provideDreamViteMatchers()

// define global context variable, setting it equal to describe
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
;(global as any).context = describe

beforeEach(async () => {
  try {
    await fs.rm('howyadoin', { force: true, recursive: true })
  } catch {
    //
  }
  await truncate(defaultDbCredentials('howyadoin', 'test'))
})

afterEach(async () => {
  try {
    // await fs.rm('howyadoin', { force: true, recursive: true })
  } catch {
    //
  }
})

export default async function truncate({
  host = 'localhost',
  port,
  name,
  user,
  password,
}: {
  user: string
  password: string
  name?: string
  host?: string
  port?: number
}) {
  // this was only ever written to clear the db between tests,
  // so there is no way to truncate in dev/prod
  if (process.env.NODE_ENV !== 'test') return false

  const client = new pg.Client({
    host,
    port,
    database: name,
    user,
    password,
  })
  await client.connect()

  await client.query(
    // rather than truncate, we actually want to clear out the entire db
    // with each run, so that subsequent runs can create new migrations
    // for the same tables.
    `DROP SCHEMA public CASCADE;
CREATE SCHEMA public;`
  )
  await client.end()
}
