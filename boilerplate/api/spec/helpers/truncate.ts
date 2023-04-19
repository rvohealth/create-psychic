import { Client } from 'pg'
import dbConfig from '../../src/conf/dream'

export default async function truncate() {
  // this was only ever written to clear the db between tests,
  // so there is no way to truncate in dev/prod
  if (process.env.NODE_ENV !== 'test') return false

  const client = new Client({
    host: dbConfig.db.host || 'localhost',
    port: dbConfig.db.port ? parseInt(dbConfig.db.port) : 5432,
    database: dbConfig.db.name,
    user: dbConfig.db.user,
    password: dbConfig.db.password,
  })
  await client.connect()

  await client.query(
    `
DO $$
DECLARE row RECORD;
BEGIN
FOR row IN SELECT table_name
  FROM information_schema.tables
  WHERE table_type='BASE TABLE'
  AND table_schema='public'
  AND table_name NOT IN ('migrations')
LOOP
  EXECUTE format('TRUNCATE TABLE %I CONTINUE IDENTITY RESTRICT;',row.table_name);
END LOOP;
END;
$$;
`
  )
  await client.end()
}
