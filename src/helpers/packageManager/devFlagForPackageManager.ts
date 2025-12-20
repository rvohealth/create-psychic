import { PsychicPackageManager } from '../newPsychicApp.js'

export default function devFlagForPackageManager(packageManager: PsychicPackageManager) {
  // the shorthand -D happens to be supported by all package
  // managers currently, but leaving this switch in case we
  // decide to support others in the future
  switch (packageManager) {
    default:
      return '-D'
  }
}
