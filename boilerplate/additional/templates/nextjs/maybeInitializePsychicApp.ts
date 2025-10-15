import initializePsychicApp from '@conf/system/initializePsychicApp.js'
import { PsychicApp } from '@rvoh/psychic'

export default async function maybeInitializePsychicApp() {
  try {
    PsychicApp.getOrFail()
  } catch {
    await initializePsychicApp()
  }
}
