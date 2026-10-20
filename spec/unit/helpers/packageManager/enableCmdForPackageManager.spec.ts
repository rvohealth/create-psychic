import { execSync } from 'node:child_process'
import enableCmdForPackageManager from '../../../../src/helpers/packageManager/enableCmdForPackageManager.js'

describe('enableCmdForPackageManager', () => {
  it('falls back to corepack only when the package manager is not already installed', () => {
    expect(enableCmdForPackageManager('pnpm')).toEqual(
      '(command -v pnpm >/dev/null 2>&1 || corepack enable pnpm)',
    )
    expect(enableCmdForPackageManager('yarn')).toEqual(
      '(command -v yarn >/dev/null 2>&1 || corepack enable yarn)',
    )
  })

  it('succeeds without corepack when the package manager is on PATH', () => {
    // pnpm runs this spec, so it is on PATH; corepack is shadowed by a failing function
    // (Node 25+ ships without it) to prove the guard short-circuits.
    expect(() =>
      execSync(`corepack() { return 127; }; ${enableCmdForPackageManager('pnpm')}`, { shell: '/bin/sh' }),
    ).not.toThrow()
  })
})
