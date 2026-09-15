import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('boilerplate/api/yarnrc.yml', () => {
  it('preapproves only the exact Express patch and trusted first-party packages', () => {
    const yarnrc = readFileSync(join(process.cwd(), 'boilerplate', 'api', 'yarnrc.yml'), 'utf8')
    const preapprovedPackages = yarnrc
      .split('npmPreapprovedPackages:\n')[1]
      ?.split('\n')
      .filter(line => line.startsWith('  - '))
      .map(line => line.slice(4))

    expect(preapprovedPackages).toEqual(["'express@4.22.3'", '"@rvoh/*"'])
  })
})
