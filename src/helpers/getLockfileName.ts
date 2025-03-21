import { PsychicPackageManager } from './newPsychicApp.js'

export default function getLockfileName(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
      return 'yarn.lock'
    case 'npm':
      return 'package-lock.json'
    case 'pnpm':
      return 'pnpm-lock.yaml'
    default:
      throw new Error(`unexpected package manager: ${packageManager}`)
  }
}
