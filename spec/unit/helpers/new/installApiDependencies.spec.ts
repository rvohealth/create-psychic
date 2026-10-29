import * as path from 'node:path'
import installApiDependencies from '../../../../src/helpers/new/installApiDependencies.js'
import { NewPsychicAppCliOptions } from '../../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../../src/helpers/sspawn.js'
import DreamCliLogger from '../../../../src/logger/DreamCliLogger.js'

vi.mock('../../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

const parentWithSpace = '/Users/someone/My Projects'

function options(overrides: Partial<NewPsychicAppCliOptions> = {}): NewPsychicAppCliOptions {
  return {
    packageManager: 'pnpm',
    primaryKeyType: 'bigint',
    client: 'none',
    adminClient: 'none',
    internalClient: 'none',
    workers: false,
    websockets: false,
    claudePsychicSkill: false,
    agentsPsychicSkill: false,
    ...overrides,
  }
}

describe('installApiDependencies', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(parentWithSpace)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(['pnpm', 'yarn', 'npm', 'bun', 'deno'] as const)(
    'runs every %s command in the api folder through `cwd`, keeping the path out of the command text',
    async packageManager => {
      await installApiDependencies('howyadoin', {
        options: options({ packageManager }),
        logger: new DreamCliLogger(),
      })

      const calls = vi.mocked(sspawn).mock.calls
      expect(calls).toHaveLength(2)
      for (const [command, spawnOptions] of calls) {
        expect(spawnOptions).toEqual(
          expect.objectContaining({ cwd: path.join(parentWithSpace, 'howyadoin') }),
        )
        expect(command).not.toContain('howyadoin')
        expect(command).not.toContain(parentWithSpace)
        expect(command).not.toMatch(/\bcd\b/)
      }
    },
  )

  it('uses the api subfolder when the app has a client', async () => {
    await installApiDependencies('howyadoin', {
      options: options({ client: 'react' }),
      logger: new DreamCliLogger(),
    })

    for (const [, spawnOptions] of vi.mocked(sspawn).mock.calls) {
      expect(spawnOptions).toEqual(
        expect.objectContaining({ cwd: path.join(parentWithSpace, 'howyadoin', 'api') }),
      )
    }
  })

  it.each(['pnpm', 'yarn'] as const)(
    'still falls back to corepack only when %s is missing',
    async packageManager => {
      await installApiDependencies('howyadoin', {
        options: options({ packageManager }),
        logger: new DreamCliLogger(),
      })

      expect(vi.mocked(sspawn).mock.calls[0]?.[0]).toContain(
        `(${packageManager} --version >/dev/null 2>&1 || corepack enable ${packageManager})`,
      )
    },
  )
})
