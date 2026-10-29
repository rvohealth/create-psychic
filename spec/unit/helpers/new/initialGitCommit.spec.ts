import * as path from 'node:path'
import initialGitCommit from '../../../../src/helpers/new/initialGitCommit.js'
import sspawn from '../../../../src/helpers/sspawn.js'
import DreamCliLogger from '../../../../src/logger/DreamCliLogger.js'

vi.mock('../../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

const parentWithSpace = '/Users/someone/My Projects'

describe('initialGitCommit', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(parentWithSpace)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('commits in the app folder through `cwd`, keeping the path out of the command text', async () => {
    await initialGitCommit('howyadoin', new DreamCliLogger())

    expect(vi.mocked(sspawn)).toHaveBeenCalledExactlyOnceWith(
      "git add --all && git commit -m 'psychic init' --quiet",
      expect.objectContaining({ cwd: path.join(parentWithSpace, 'howyadoin') }),
    )
  })
})
