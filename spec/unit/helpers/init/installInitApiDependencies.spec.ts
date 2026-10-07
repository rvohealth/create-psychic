import installInitApiDependencies from '../../../../src/helpers/init/installInitApiDependencies.js'
import sspawn from '../../../../src/helpers/sspawn.js'
import initPsychicAppDefaults from '../../../helpers/initPsychicAppDefaults.js'

vi.mock('../../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

describe('installInitApiDependencies', () => {
  it('installs the supported Vitest range', async () => {
    await installInitApiDependencies(initPsychicAppDefaults())

    expect(vi.mocked(sspawn)).toHaveBeenNthCalledWith(2, expect.stringContaining('vitest@^4.1.11'))
  })

  it('does not install nodemon', async () => {
    await installInitApiDependencies({ ...initPsychicAppDefaults(), dreamOnly: false })

    const devDepsCmd = vi.mocked(sspawn).mock.calls[1]![0]
    expect(devDepsCmd).toContain('puppeteer')
    expect(devDepsCmd).not.toMatch(/\bnodemon\b/)
  })
})
