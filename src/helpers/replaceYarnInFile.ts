import * as fs from 'fs/promises'
import { PsychicPackageManager } from './newPsychicApp.js'

export default async function replaceYarnInFile(filepath: string, packageManager: PsychicPackageManager) {
  const file = (await fs.readFile(filepath)).toString()
  const newFile = replaceYarnInFileContents(file, packageManager)
  await fs.writeFile(filepath, newFile)
}

export function replaceYarnInFileContents(fileContents: string, packageManager: PsychicPackageManager) {
  return fileContents
    .replace(/<YARN> --cwd/g, `${runCommand(packageManager)} ${cwdOption(packageManager)}`)
    .replace(/<YARN> run/g, `${runCommand(packageManager)}`)
    .replace(/<YARN_RUN>/g, `${runCommand(packageManager)}`)
    .replace(/<YARN> /g, `${runCommand(packageManager)} `)
    .replace(/yarn --cwd/g, `${runCommand(packageManager)} ${cwdOption(packageManager)}`)
    .replace(/yarn run/g, runCommand(packageManager))
    .replace(/yarn /g, `${runCommand(packageManager)} `)
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
      throw new Error(`unexpected package manager: ${packageManager}`)
  }
}

function runCommand(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
    case 'pnpm':
      return packageManager
    case 'npm':
      return `${packageManager} run`
    default:
      throw new Error(`unexpected package manager: ${packageManager}`)
  }
}
