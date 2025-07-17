import * as path from 'node:path'
import { NewPsychicAppCliOptions } from './newPsychicApp.js'

export default function getApiRoot(appName: string, options: NewPsychicAppCliOptions) {
  const hasClient = options.client !== 'none' || options.adminClient !== 'none'
  return hasClient ? path.join(process.cwd(), appName, 'api') : path.join(process.cwd(), appName)
}
