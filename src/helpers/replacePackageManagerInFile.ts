import * as fs from 'node:fs/promises'
import { PsychicPackageManager } from './newPsychicApp.js'
import runCmdForPackageManager from './packageManager/runCmdForPackageManager.js'
import tscAliasCmdForPackageManager from './packageManager/tscAliasCmdForPackageManager.js'
import tscCmdForPackageManager from './packageManager/tscCmdForPackageManager.js'

export default async function replacePackageManagerInFile(
  filepath: string,
  packageManager: PsychicPackageManager,
) {
  const file = (await fs.readFile(filepath)).toString()
  const newFile = replacePackageManagerInFileContents(file, packageManager)
  await fs.writeFile(filepath, newFile)
}

export function replacePackageManagerInFileContents(
  fileContents: string,
  packageManager: PsychicPackageManager,
) {
  const runCmd = runCmdForPackageManager(packageManager)
  const tscCmd = tscCmdForPackageManager(packageManager)
  const tscAliasCmd = tscAliasCmdForPackageManager(packageManager)

  return fileContents
    .replace(/\{\{PM\}\}/g, runCmd)
    .replace(/\{\{PM_CWD\}\}/g, `${runCmd} ${cwdOption(packageManager)}`)
    .replace(/\{\{TSC_COMMAND\}\}/g, tscCmd)
    .replace(/\{\{TSC_ALIAS_COMMAND\}\}/g, tscAliasCmd)
}

function cwdOption(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
      return '--cwd'
    case 'npm':
      return '--prefix'
    case 'pnpm':
      return '--dir'
    default:
      throw new Error(`unexpected package manager: ${packageManager as unknown as 'yarn'}`)
  }
}
