import { PsychicPackageManager } from '../newPsychicApp.js'

export default function runCmdForPackageManager(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
      return packageManager
    case 'npm':
      return `${packageManager} run`
    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
