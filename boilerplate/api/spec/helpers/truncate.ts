import { Client } from 'pg'

export default async function truncate() {
  // this was only ever written to clear the db between tests,
  // so there is no way to truncate in dev/prod
  if (process.env.NODE_ENV !== 'test') return false

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
  EXECUTE format('TRUNCATE TABLE %I CASCADE;',row.table_name);
END LOOP;
END;
$$;
`
  )
  await client.end()
}
