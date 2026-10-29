/**
 * Builds the shell command that makes pnpm or yarn available before it is used.
 * A package manager that runs is used as-is; otherwise corepack provides it.
 * Node 25+ no longer bundles corepack, so an unconditional `corepack enable`
 * fails with "corepack: command not found" even when pnpm/yarn is installed.
 *
 * The check runs `<pm> --version`, not `command -v <pm>`: a version manager's
 * shim, such as nodenv's, makes the name resolve even when the active Node has
 * no such package manager, and the shim then exits 127 when it is run.
 *
 * ```ts
 * enableCmdForPackageManager('pnpm')
 * // => '(pnpm --version >/dev/null 2>&1 || corepack enable pnpm)'
 * ```
 */
export default function enableCmdForPackageManager(packageManager: 'pnpm' | 'yarn'): string {
  return `(${packageManager} --version >/dev/null 2>&1 || corepack enable ${packageManager})`
}
