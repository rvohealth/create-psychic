import { InitPsychicAppCliOptions } from './newPsychicApp.js'

export default function apiOnlyOptions(options: InitPsychicAppCliOptions): boolean {
  return options.client === 'none' && options.adminClient === 'none'
}
