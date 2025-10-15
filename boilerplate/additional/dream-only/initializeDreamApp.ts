import dreamConfCb from '@conf/dream.js'
import { DreamApp, DreamAppInitOptions } from '@rvoh/dream'

export default async function initializeDreamApp(opts: DreamAppInitOptions = {}) {
  return await DreamApp.init(dreamConfCb, opts)
}
