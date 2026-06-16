import dlxCmdForPackageManager from '../../../../src/helpers/packageManager/dlxCmdForPackageManager.js'

describe('dlxCmdForPackageManager', () => {
  it('fetches and runs a one-off remote package with the selected package manager / runtime', () => {
    expect(dlxCmdForPackageManager('npm', 'nuxi@latest')).toEqual('npx nuxi@latest')
    expect(dlxCmdForPackageManager('pnpm', 'nuxi@latest')).toEqual('pnpm dlx nuxi@latest')
    expect(dlxCmdForPackageManager('yarn', 'nuxi@latest')).toEqual('yarn dlx nuxi@latest')
    expect(dlxCmdForPackageManager('bun', 'nuxi@latest')).toEqual('bunx nuxi@latest')
    expect(dlxCmdForPackageManager('deno', 'nuxi@latest')).toEqual('deno run -A npm:nuxi@latest')
  })
})
