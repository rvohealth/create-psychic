import { NewPsychicAppCliOptions } from './newPsychicApp.js'

export default function apiOnlyOptions(options: NewPsychicAppCliOptions): boolean {
  return options.client === 'none' && options.adminClient === 'none'
}
