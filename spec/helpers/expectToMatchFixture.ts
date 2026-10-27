import internalSrcPath from '../../src/helpers/internalSrcPath.js'
import readFile from './readFile.js'

export default async function expectToMatchFixture(fixturePath: FixturePath, actualContent: string) {
  const fixture = await readFile(internalSrcPath(`../spec/fixtures/${fixturePath}`))
  expect(actualContent).toEqual(fixture)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FIXTURE_PATHS = [
  'expected-files/app/basic.ts',
  'expected-files/app/with-client.ts',
  'expected-files/app/with-admin.ts',
  'expected-files/app/with-client-and-admin.ts',
  'expected-files/app/with-internal.ts',
  'expected-files/app/with-client-and-internal.ts',
  'expected-files/app/with-workers.ts',
  'expected-files/app/with-workers-and-websockets.ts',
  'expected-files/app/with-websockets.ts',

  'expected-files/AppWs/basic.ts',

  'expected-files/spec/features/setup/globalSetup-basic.ts',
  'expected-files/spec/features/setup/globalSetup-with-client.ts',
  'expected-files/spec/features/setup/globalSetup-with-admin.ts',
  'expected-files/spec/features/setup/globalSetup-with-client-and-admin.ts',
  'expected-files/spec/features/setup/globalSetup-with-internal.ts',
  'expected-files/spec/features/setup/globalSetup-with-client-and-internal.ts',

  'expected-files/spec/features/setup/hooks-basic.ts',
  'expected-files/spec/features/setup/hooks-with-websockets.ts',

  'expected-files/spec/features/example-feature-spec/with-none.spec.ts',
  'expected-files/spec/features/example-feature-spec/with-react.spec.ts',

  // init
  'expected-files/app/init/basic.ts',
  'expected-files/dream/init/basic.ts',
  'expected-files/cli/dream-only.ts',

  // docker-compose: client-basic.yml for a Vite (react, vue) or Nuxt client,
  // client-nextjs.yml for a Next.js one, whose dev server takes `--hostname`, not `--host`,
  // and client-websockets.yml for a Vite client with websockets
  'expected-files/docker-compose/pnpm/client-basic.yml',
  'expected-files/docker-compose/pnpm/client-nextjs.yml',
  'expected-files/docker-compose/pnpm/client-websockets.yml',
  'expected-files/docker-compose/pnpm/no-client-basic.yml',
  'expected-files/docker-compose/npm/client-basic.yml',
  'expected-files/docker-compose/npm/client-nextjs.yml',
  'expected-files/docker-compose/npm/no-client-basic.yml',
  'expected-files/docker-compose/yarn/client-basic.yml',
  'expected-files/docker-compose/yarn/client-nextjs.yml',
  'expected-files/docker-compose/yarn/no-client-basic.yml',
  'expected-files/docker-compose/yarn/workers-basic.yml',
  'expected-files/docker-compose/yarn/websockets-basic.yml',
] as const

type FixturePath = (typeof FIXTURE_PATHS)[number]
