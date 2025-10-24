import dreamConfCb from '@conf/dream.js'
import { DreamApp } from '@rvoh/dream'
import { DreamAppInitOptions } from '@rvoh/dream/types'

export default async function initializeDreamApp(opts: DreamAppInitOptions = {}) {
  return await DreamApp.init(dreamConfCb, opts)
}
