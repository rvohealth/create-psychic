import initializeDreamApp from '@conf/system/initializeDreamApp.js'
import { DreamApp } from '@rvoh/dream'

export default async function maybeInitializeDreamApp() {
  try {
    DreamApp.getOrFail()
  } catch {
    await initializeDreamApp()
  }
}
