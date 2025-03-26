import * as path from 'node:path'
import { InitPsychicAppCliOptions } from './newPsychicApp.js'

export default function getApiRoot(appName: string, options: InitPsychicAppCliOptions) {
  const hasClient = options.client !== 'none' || options.adminClient !== 'none'
  return hasClient ? path.join(process.cwd(), appName, 'api') : path.join(process.cwd(), appName)
}
