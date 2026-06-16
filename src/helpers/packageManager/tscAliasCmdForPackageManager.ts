import { PsychicPackageManager } from '../newPsychicApp.js'

export default function tscAliasCmdForPackageManager(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
      return `${packageManager} tsc`

    case 'npm':
      return './node_modules/.bin/tsc'

    case 'bun':
      return 'bunx tsc'

    case 'deno':
      return 'deno run -A npm:typescript/tsc'

    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
