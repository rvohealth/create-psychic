import * as path from 'node:path'
import * as fs from 'node:fs'
import runCmdForPackageManager from './runCmdForPackageManager.js'
import { DreamAppAllowedPackageManagersEnum } from '@rvoh/dream/system'

export default function sanitizeAgentsFileContents(
  apiRoot: string,
  packageManager: DreamAppAllowedPackageManagersEnum,
) {
  const agentsPath = path.join(apiRoot, 'AGENTS.md')
  fs.writeFileSync(
    agentsPath,
    fs.readFileSync(agentsPath).toString() +
      `\
## Package Manager Configuration

**Package Manager Run Command**: \`${runCmdForPackageManager(packageManager)}\`
`,
  )
}
