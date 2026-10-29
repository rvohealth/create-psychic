import { PsychicPackageManager } from '../newPsychicApp.js'

/**
 * Builds the command to run a one-off REMOTE package that is not a project
 * dependency — a scaffolder like `nuxi`, fetched on demand — with the selected
 * package manager / runtime. This is the "download-and-run" analogue of
 * {@link execCmdForPackageManager} (which runs an already-installed bin): npm and
 * yarn use `npx`, bun uses `bunx`, pnpm uses `dlx`, and Deno runs the npm specifier.
 * Yarn 1, the Yarn a Node 25+ machine without corepack usually has, has no `dlx` and
 * runs `yarn dlx` as the package.json script `dlx`, so yarn uses npm's `npx`.
 *
 * For a `create-<x>` initializer, prefer the package manager's `create` shorthand
 * (e.g. `pnpm create next-app`) instead — see `viteCmd`/`nextAppCmd` in addClientApp.
 *
 * ```ts
 * dlxCmdForPackageManager('pnpm', 'nuxi@latest') // => 'pnpm dlx nuxi@latest'
 * dlxCmdForPackageManager('npm', 'nuxi@latest')  // => 'npx nuxi@latest'
 * ```
 */
export default function dlxCmdForPackageManager(
  packageManager: PsychicPackageManager,
  packageSpec: string,
): string {
  switch (packageManager) {
    case 'npm':
    case 'yarn':
      return `npx ${packageSpec}`
    case 'pnpm':
      return `pnpm dlx ${packageSpec}`
    case 'bun':
      return `bunx ${packageSpec}`
    case 'deno':
      return `deno run -A npm:${packageSpec}`
    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
