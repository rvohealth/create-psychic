/**
 * Builds the shell command that makes pnpm or yarn available before it is used.
 * An already-installed binary is used as-is; otherwise corepack provides it.
 * Node 25+ no longer bundles corepack, so an unconditional `corepack enable`
 * fails with "corepack: command not found" even when pnpm/yarn is installed.
 *
 * ```ts
 * enableCmdForPackageManager('pnpm')
 * // => '(command -v pnpm >/dev/null 2>&1 || corepack enable pnpm)'
 * ```
 */
export default function enableCmdForPackageManager(packageManager: 'pnpm' | 'yarn'): string {
  return `(command -v ${packageManager} >/dev/null 2>&1 || corepack enable ${packageManager})`
}
