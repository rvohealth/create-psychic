import { PsychicApp } from '@rvoh/psychic'
import initializePsychicApp from './initializePsychicApp.js'

export default async function maybeInitializePsychicApp() {
  try {
    PsychicApp.getOrFail()
  } catch {
    await initializePsychicApp()
  }
}
