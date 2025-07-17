import internalSrcPath from '../../src/helpers/internalSrcPath.js'
import readFile from './readFile.js'

export default async function expectToMatchFixture(fixturePath: FixturePath, actualContent: string) {
  const fixture = await readFile(internalSrcPath(`../spec/fixtures/${fixturePath}`))
  expect(actualContent).toEqual(fixture)
}

const FIXTURE_PATHS = [
  'expected-files/app/basic.ts',
  'expected-files/app/with-client.ts',
  'expected-files/app/with-admin.ts',
  'expected-files/app/with-client-and-admin.ts',
  'expected-files/app/with-workers.ts',
  'expected-files/app/with-workers-and-websockets.ts',
  'expected-files/app/with-websockets.ts',

  'expected-files/ws/basic.ts',

  'expected-files/spec/features/setup/globalSetup-basic.ts',
  'expected-files/spec/features/setup/globalSetup-with-client.ts',
  'expected-files/spec/features/setup/globalSetup-with-admin.ts',
  'expected-files/spec/features/setup/globalSetup-with-client-and-admin.ts',

  'expected-files/spec/features/example-feature-spec/with-none.spec.ts',
  'expected-files/spec/features/example-feature-spec/with-react.spec.ts',

  // init
  'expected-files/app/init/basic.ts',
  'expected-files/dream/init/basic.ts',
  'expected-files/cli/dream-only.ts',
] as const

type FixturePath = (typeof FIXTURE_PATHS)[number]
