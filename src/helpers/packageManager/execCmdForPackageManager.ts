import { PsychicPackageManager } from '../newPsychicApp.js'

/**
 * Builds the command to run an INSTALLED dependency's binary (e.g. puppeteer) with
 * the selected package manager / runtime. This is the binary-exec analogue of
 * {@link runCmdForPackageManager} (which runs a package.json script): npm uses
 * `npx`, pnpm/yarn run the dependency's bin directly, bun uses `bunx`, and Deno
 * runs the npm specifier.
 *
 * ```ts
 * execCmdForPackageManager('pnpm', 'puppeteer', 'browsers install firefox')
 * // => 'pnpm puppeteer browsers install firefox'
 * execCmdForPackageManager('deno', 'puppeteer', 'browsers install firefox')
 * // => 'deno run -A npm:puppeteer browsers install firefox'
 * ```
 */
export default function execCmdForPackageManager(
  packageManager: PsychicPackageManager,
  bin: string,
  args: string = '',
): string {
  const trailing = args ? ` ${args}` : ''

  switch (packageManager) {
    case 'npm':
      return `npx ${bin}${trailing}`
    case 'pnpm':
    case 'yarn':
      return `${packageManager} ${bin}${trailing}`
    case 'bun':
      return `bunx ${bin}${trailing}`
    case 'deno':
      // Deno has no local-bin shim; run the package straight from npm.
      return `deno run -A npm:${bin}${trailing}`
    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
