import installInitApiDependencies from '../../../../src/helpers/init/installInitApiDependencies.js'
import sspawn from '../../../../src/helpers/sspawn.js'
import initPsychicAppDefaults from '../../../helpers/initPsychicAppDefaults.js'

vi.mock('../../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

describe('installInitApiDependencies', () => {
  it('installs the supported Vitest range', async () => {
    await installInitApiDependencies(initPsychicAppDefaults())

    expect(vi.mocked(sspawn)).toHaveBeenNthCalledWith(2, expect.stringContaining('vitest@^4.1.11'))
  })

  it('does not install kysely-codegen, which Dream 2.37.0 and later no longer use', async () => {
    await installInitApiDependencies(initPsychicAppDefaults())

    const commands = vi.mocked(sspawn).mock.calls.map(([command]) => command)
    expect(commands).toHaveLength(2)
    for (const command of commands) expect(command).not.toContain('kysely-codegen')
  })

  it('does not install tsc-alias, which `#` subpath imports do not need', async () => {
    await installInitApiDependencies(initPsychicAppDefaults())

    const commands = vi.mocked(sspawn).mock.calls.map(([command]) => command)
    expect(commands).toHaveLength(2)
    for (const command of commands) expect(command).not.toContain('tsc-alias')
  })
})
