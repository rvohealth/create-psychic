import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import enableCmdForPackageManager from '../../../../src/helpers/packageManager/enableCmdForPackageManager.js'

describe('enableCmdForPackageManager', () => {
  let binDir: string
  let corepackLog: string

  beforeEach(() => {
    binDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enable-cmd-'))
    corepackLog = path.join(binDir, 'corepack.log')
    // A stand-in corepack that records the arguments it was called with.
    fs.writeFileSync(path.join(binDir, 'corepack'), '#!/bin/sh\necho "$@" >> "$COREPACK_LOG"\n', {
      mode: 0o755,
    })
  })

  afterEach(() => {
    fs.rmSync(binDir, { recursive: true, force: true })
  })

  // Puts an executable named after the package manager first on PATH, runs the
  // generated command in /bin/sh, and returns what the stand-in corepack was
  // called with ('' when it never ran).
  function runWithStandInPackageManager(packageManager: 'pnpm' | 'yarn', script: string) {
    fs.writeFileSync(path.join(binDir, packageManager), `#!/bin/sh\n${script}\n`, { mode: 0o755 })
    const env = { ...process.env, PATH: `${binDir}:${process.env.PATH}`, COREPACK_LOG: corepackLog }

    // the name resolves either way, as it does through a version manager's shim
    expect(execSync(`command -v ${packageManager}`, { shell: '/bin/sh', env }).toString().trim()).toEqual(
      path.join(binDir, packageManager),
    )

    execSync(enableCmdForPackageManager(packageManager), { shell: '/bin/sh', env })
    return fs.existsSync(corepackLog) ? fs.readFileSync(corepackLog, 'utf8').trim() : ''
  }

  it('checks that the package manager runs, not only that its name resolves', () => {
    expect(enableCmdForPackageManager('pnpm')).toEqual(
      '(pnpm --version >/dev/null 2>&1 || corepack enable pnpm)',
    )
    expect(enableCmdForPackageManager('yarn')).toEqual(
      '(yarn --version >/dev/null 2>&1 || corepack enable yarn)',
    )
  })

  context('when a shim resolves the name but cannot run the package manager', () => {
    // what nodenv's shim does when the active Node has no such command
    const shim = (packageManager: string) =>
      `echo "nodenv: ${packageManager}: command not found" >&2\nexit 127`

    it('enables corepack for yarn', () => {
      expect(runWithStandInPackageManager('yarn', shim('yarn'))).toEqual('enable yarn')
    })

    it('enables corepack for pnpm', () => {
      expect(runWithStandInPackageManager('pnpm', shim('pnpm'))).toEqual('enable pnpm')
    })
  })

  context('when the package manager is installed and runs', () => {
    it('leaves corepack alone for yarn', () => {
      expect(runWithStandInPackageManager('yarn', 'echo 4.18.1')).toEqual('')
    })

    it('leaves corepack alone for pnpm', () => {
      expect(runWithStandInPackageManager('pnpm', 'echo 11.21.0')).toEqual('')
    })
  })

  it('succeeds without corepack when the real pnpm is on PATH', () => {
    // pnpm runs this spec, so it is on PATH; corepack is shadowed by a failing function
    // (Node 25+ ships without it) to prove the guard short-circuits.
    expect(() =>
      execSync(`corepack() { return 127; }; ${enableCmdForPackageManager('pnpm')}`, { shell: '/bin/sh' }),
    ).not.toThrow()
  })
})
