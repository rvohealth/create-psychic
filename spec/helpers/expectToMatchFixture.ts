import srcPath from '../../src/helpers/srcPath'
import readFile from './readFile'

export default async function expectToMatchFixture(fixturePath: FixturePath, expectedContent: string) {
  const fixture = await readFile(srcPath(`../spec/fixtures/${fixturePath}`))
  expect(fixture).toEqual(expectedContent)
}

const FIXTURE_PATHS = [
  'expected-files/app/no-workers.ts',
  'expected-files/app/yes-workers.ts',

  'expected-files/initializePsychicApplication/no-workers-no-websockets.ts',
  'expected-files/initializePsychicApplication/no-workers-yes-websockets.ts',
  'expected-files/initializePsychicApplication/yes-workers-no-websockets.ts',
  'expected-files/initializePsychicApplication/yes-workers-yes-websockets.ts',

  'expected-files/ws/basic.ts',
] as const

type FixturePath = (typeof FIXTURE_PATHS)[number]
