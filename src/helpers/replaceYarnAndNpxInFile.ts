import * as fs from 'node:fs/promises'
import { PsychicPackageManager } from './newPsychicApp.js'
import runCmdForPackageManager from './packageManager/runCmdForPackageManager.js'
import npxCmdForPackageManager from './packageManager/npxCmdForPackageManager.js'

export default async function replaceYarnInFile(filepath: string, packageManager: PsychicPackageManager) {
  const file = (await fs.readFile(filepath)).toString()
  const newFile = replaceYarnAndNpxInFileContents(file, packageManager)
  await fs.writeFile(filepath, newFile)
}

export function replaceYarnAndNpxInFileContents(fileContents: string, packageManager: PsychicPackageManager) {
  const runCmd = runCmdForPackageManager(packageManager)
  const npxCmd = npxCmdForPackageManager(packageManager)

  return fileContents
    .replace(/<YARN> --cwd/g, `${runCmd} ${cwdOption(packageManager)}`)
    .replace(/<YARN> run/g, runCmd)
    .replace(/<YARN_RUN>/g, runCmd)
    .replace(/<YARN>/g, runCmd)
    .replace(/yarn --cwd/g, `${runCmd} ${cwdOption(packageManager)}`)
    .replace(/yarn run/g, runCmd)
    .replace(/yarn /g, `${runCmd} `)
    .replace(/<NPX_RUN>/g, npxCmd)
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
