import { PsychicPackageManager } from '../newPsychicApp.js'
import devFlagForPackageManager from './devFlagForPackageManager.js'

export default function addCmdForPackageManager(
  packageManager: PsychicPackageManager,
  { dev = false }: { dev?: boolean } = {},
) {
  const devFlag = dev ? `${devFlagForPackageManager(packageManager)} ` : ''
  switch (packageManager) {
    case 'npm':
      return `${packageManager} install ${devFlag}`

    default:
      return `${packageManager} add ${devFlag}`
  }
}
