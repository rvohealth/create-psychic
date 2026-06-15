import execCmdForPackageManager from '../../../../src/helpers/packageManager/execCmdForPackageManager.js'

describe('execCmdForPackageManager', () => {
  it('runs the dependency bin with the selected package manager / runtime', () => {
    expect(execCmdForPackageManager('npm', 'puppeteer', 'browsers install firefox')).toEqual(
      'npx puppeteer browsers install firefox',
    )
    expect(execCmdForPackageManager('pnpm', 'puppeteer', 'browsers install firefox')).toEqual(
      'pnpm puppeteer browsers install firefox',
    )
    expect(execCmdForPackageManager('yarn', 'puppeteer', 'browsers install firefox')).toEqual(
      'yarn puppeteer browsers install firefox',
    )
    expect(execCmdForPackageManager('bun', 'puppeteer', 'browsers install firefox')).toEqual(
      'bunx puppeteer browsers install firefox',
    )
    expect(execCmdForPackageManager('deno', 'puppeteer', 'browsers install firefox')).toEqual(
      'deno run -A npm:puppeteer browsers install firefox',
    )
  })

  it('omits the trailing space when there are no args', () => {
    expect(execCmdForPackageManager('pnpm', 'puppeteer')).toEqual('pnpm puppeteer')
    expect(execCmdForPackageManager('deno', 'puppeteer')).toEqual('deno run -A npm:puppeteer')
  })
})
