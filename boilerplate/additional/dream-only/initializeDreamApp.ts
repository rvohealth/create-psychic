import { DreamApp, DreamAppInitOptions } from '@rvoh/dream'
import dreamConfCb from '../dream.js'

export default async function initializeDreamApp(opts: DreamAppInitOptions = {}) {
  return await DreamApp.init(dreamConfCb, opts)
}
