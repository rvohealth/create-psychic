import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import sspawn from '../../../src/helpers/sspawn.js'

describe('sspawn', () => {
  let parentWithSpace: string

  beforeEach(() => {
    parentWithSpace = fs.mkdtempSync(path.join(os.tmpdir(), 'psychic parent '))
  })

  afterEach(() => {
    fs.rmSync(parentWithSpace, { recursive: true, force: true })
  })

  it('runs the command in the `cwd` option, even when that path contains a space', async () => {
    await sspawn('touch ran-here', { cwd: parentWithSpace })

    expect(fs.existsSync(path.join(parentWithSpace, 'ran-here'))).toBe(true)
  })

  it('names the `cwd` in the error when the command fails', async () => {
    await expect(sspawn('exit 3', { cwd: parentWithSpace })).rejects.toThrow(
      `process exited with code 3 running: exit 3 (in ${parentWithSpace})`,
    )
  })
})
