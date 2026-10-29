import { PsychicPackageManager } from '../newPsychicApp.js'

/**
 * Builds the command to run a one-off REMOTE package that is not a project
 * dependency — a scaffolder like `nuxi`, fetched on demand — with the selected
 * package manager / runtime. This is the "download-and-run" analogue of
 * {@link execCmdForPackageManager} (which runs an already-installed bin): npm and
 * yarn use `npx`, bun uses `bunx`, pnpm uses `dlx`, and Deno runs the npm specifier.
 * Yarn 1, the Yarn a Node 25+ machine without corepack usually has, has no `dlx` and
 * runs `yarn dlx` as the package.json script `dlx`, so yarn uses npm's `npx`. `npx`
 * gets the 3-day `min-release-age` a new npm app's `.npmrc` sets, since the scaffolder
 * runs in the app folder, outside the api folder that holds that `.npmrc` (Yarn 2+'s
 * `dlx` applies a 1-day cooldown by default). npm before 11.10 warns about the flag
 * and runs without it.
 *
 * For a `create-<x>` initializer, prefer the package manager's `create` shorthand
 * (e.g. `pnpm create next-app`) instead — see `viteCmd`/`nextAppCmd` in addClientApp.
 *
 * ```ts
 * dlxCmdForPackageManager('pnpm', 'nuxi@latest') // => 'pnpm dlx nuxi@latest'
 * dlxCmdForPackageManager('npm', 'nuxi@latest')  // => 'npx --min-release-age=3 nuxi@latest'
 * ```
 */
export default function dlxCmdForPackageManager(
  packageManager: PsychicPackageManager,
  packageSpec: string,
): string {
  switch (packageManager) {
    case 'npm':
    case 'yarn':
      return `npx --min-release-age=3 ${packageSpec}`
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
