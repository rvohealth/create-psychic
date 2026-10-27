import * as path from 'node:path'
import gitInit from '../../../src/helpers/gitInit.js'
import sspawn from '../../../src/helpers/sspawn.js'
import DreamCliLogger from '../../../src/logger/DreamCliLogger.js'

vi.mock('../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

const parentWithSpace = '/Users/someone/My Projects'

describe('gitInit', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(parentWithSpace)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('runs git init in the app folder through `cwd`, keeping the path out of the command text', async () => {
    await gitInit('howyadoin', new DreamCliLogger())

    expect(vi.mocked(sspawn)).toHaveBeenCalledExactlyOnceWith(
      'git init',
      expect.objectContaining({ cwd: path.join(parentWithSpace, 'howyadoin') }),
    )
  })
})
