import * as fs from 'node:fs/promises'
import { PsychicPackageManager } from './newPsychicApp.js'
import runCmdForPackageManager from './packageManager/runCmdForPackageManager.js'

export default async function replacePackageManagerInFile(
  filepath: string,
  packageManager: PsychicPackageManager,
  frontEndPackageManager: PsychicPackageManager = packageManager,
) {
  const file = (await fs.readFile(filepath)).toString()
  const newFile = replacePackageManagerInFileContents(file, packageManager, frontEndPackageManager)
  await fs.writeFile(filepath, newFile)
}

// `{{PM}}` resolves against the API runtime's package manager.
// `{{PM_CWD}}` is different: it ONLY ever appears in the cross-directory front-end
// client wrappers (`{{PM_CWD}}=../client next dev`, etc.), so it resolves against
// the FRONT-END package manager — which differs from the API runtime only for Deno
// (Deno API → pnpm front end). `frontEndPackageManager` defaults to `packageManager`
// for callers whose files carry no `{{PM_CWD}}` (the vast majority).
export function replacePackageManagerInFileContents(
  fileContents: string,
  packageManager: PsychicPackageManager,
  frontEndPackageManager: PsychicPackageManager = packageManager,
) {
  const runCmd = runCmdForPackageManager(packageManager)
  const feRunCmd = runCmdForPackageManager(frontEndPackageManager)

  return fileContents
    .replace(/\{\{PM\}\}/g, runCmd)
    .replace(/\{\{PM_CWD\}\}/g, `${feRunCmd} ${cwdOption(frontEndPackageManager)}`)
}

function cwdOption(packageManager: PsychicPackageManager) {
  switch (packageManager) {
    case 'yarn':
      return '--cwd'
    case 'npm':
      return '--prefix'
    case 'pnpm':
      return '--dir'
    // bun and deno both accept `--cwd <dir>` to run a script in another package
    // (the front-end client wrappers). Cross-dir client running under bun/deno is
    // only exercised by monorepo layouts; the api-only path the runtime spike
    // covered never reaches this.
    case 'bun':
    case 'deno':
      return '--cwd'
    default:
      throw new Error(`unexpected package manager: ${packageManager as unknown as 'yarn'}`)
  }
}
