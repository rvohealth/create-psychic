import { DreamApp } from '@rvoh/dream'
import initializeDreamApp from './initializeDreamApp.js'

export default async function maybeInitializeDreamApp() {
  try {
    DreamApp.getOrFail()
  } catch {
    await initializeDreamApp()
  }
}
