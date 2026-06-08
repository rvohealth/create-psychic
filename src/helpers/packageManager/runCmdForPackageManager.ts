import { PsychicPackageManager } from '../newPsychicApp.js'

export default function runCmdForPackageManager(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
      return packageManager
    case 'npm':
      return `${packageManager} run`
    case 'bun':
      // `bun <script>` is file execution; `bun run` resolves a package.json script.
      return 'bun run'
    case 'deno':
      // Deno has no `<pm> <script>` shorthand; `deno task` resolves a
      // package.json script (or deno.json task) and forwards trailing args.
      return 'deno task'
    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
