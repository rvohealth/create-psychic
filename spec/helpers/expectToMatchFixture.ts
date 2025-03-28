import srcPath from '../../src/conf/system/srcPath.js'
import readFile from './readFile.js'

export default async function expectToMatchFixture(fixturePath: FixturePath, expectedContent: string) {
  const fixture = await readFile(srcPath(`../spec/fixtures/${fixturePath}`))
  expect(fixture).toEqual(expectedContent)
}

const FIXTURE_PATHS = [
  'expected-files/app/no-workers.ts',
  'expected-files/app/yes-workers.ts',
  'expected-files/app/with-client.ts',
  'expected-files/app/with-admin.ts',
  'expected-files/app/with-client-and-admin.ts',

  'expected-files/initializePsychicApplication/no-workers-no-websockets.ts',
  'expected-files/initializePsychicApplication/no-workers-yes-websockets.ts',
  'expected-files/initializePsychicApplication/yes-workers-no-websockets.ts',
  'expected-files/initializePsychicApplication/yes-workers-yes-websockets.ts',

  'expected-files/ws/basic.ts',

  'expected-files/spec/features/setup/globalSetup-basic.ts',
  'expected-files/spec/features/setup/globalSetup-with-client.ts',
  'expected-files/spec/features/setup/globalSetup-with-admin.ts',
  'expected-files/spec/features/setup/globalSetup-with-client-and-admin.ts',

  'expected-files/spec/features/example-feature-spec/with-none.spec.ts',
  'expected-files/spec/features/example-feature-spec/with-react.spec.ts',
] as const

type FixturePath = (typeof FIXTURE_PATHS)[number]
