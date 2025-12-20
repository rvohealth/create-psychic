import { InitPsychicAppCliOptions } from '../newPsychicApp.js'
import runCmdForPackageManager from '../packageManager/runCmdForPackageManager.js'

export default function psyCmdForInitOptions(options: InitPsychicAppCliOptions) {
  const runCmd = runCmdForPackageManager(options.packageManager)
  return `${runCmd} ${options.dreamOnly ? 'dream' : 'psy'}`
}
