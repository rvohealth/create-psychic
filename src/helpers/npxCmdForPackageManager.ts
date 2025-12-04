import { PsychicPackageManager } from './newPsychicApp.js'

export default function npxCmdForPackageManager(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
      return packageManager
    case 'npm':
      return `npx`
    default:
      throw new Error(`unexpected package manager: ${packageManager as string}`)
  }
}
