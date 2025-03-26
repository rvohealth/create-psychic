import * as fs from 'node:fs'
import * as path from 'node:path'
import DreamCliLogger from '../logger/DreamCliLogger.js'
import colorize from '../logger/loggable/colorize.js'
import getApiRoot from './getApiRoot.js'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'
import runCmdForPackageManager from './runCmdForPackageManager.js'
import sspawn from './sspawn.js'
import UuidExtensionMigrationBuilder from '../file-builders/UuidExtensionMigrationBuilder.js'

export default async function generateUuidMigration(
  appName: string,
  { logger, options }: { logger: DreamCliLogger; options: InitPsychicAppCliOptions }
) {
  const apiRoot = getApiRoot(appName, options)

  logger.logStartProgress('generating initial uuid migration...')
  const runCmd = runCmdForPackageManager(options.packageManager)

  // do not use git during tests, since this will break in CI
  await sspawn(`cd ${apiRoot} && ${runCmd} psy g:migration add-uuid-extension`, {
    onStdout: message => {
      logger.logContinueProgress(colorize('[api]', { color: 'cyan' }) + ' ' + message, {
        logPrefixColor: 'cyan',
      })
    },
  })

  const migrations = fs.readdirSync(path.join(apiRoot, 'src', 'db', 'migrations'))
  const migration = migrations.find(filePath => /add-uuid-extension\.ts$/.test(filePath))!

  if (!migration) {
    throw new Error(
      `Failed to generate initial uuid migration. Migration not found matching: "add-uuid-extension.ts"`
    )
  }

  fs.writeFileSync(
    path.join(apiRoot, 'src', 'db', 'migrations', migration),
    UuidExtensionMigrationBuilder.build()
  )

  logger.logEndProgress()
}
