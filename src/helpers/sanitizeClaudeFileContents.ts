import { DreamAppAllowedPackageManagersEnum } from '@rvoh/dream/system'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { replacePackageManagerInFileContents } from './replacePackageManagerInFile.js'

export default function sanitizeAgentsFileContents(
  apiRoot: string,
  packageManager: DreamAppAllowedPackageManagersEnum,
) {
  const agentsPath = path.join(apiRoot, 'AGENTS.md')
  fs.writeFileSync(
    agentsPath,
    replacePackageManagerInFileContents(fs.readFileSync(agentsPath).toString(), packageManager),
  )
}
