import apiOnlyOptions from '../../src/helpers/apiOnlyOptions.js'
import newPsychicApp, { InitPsychicAppCliOptions } from '../../src/helpers/newPsychicApp.js'
import sspawn from '../../src/helpers/sspawn.js'

export default async function newSpecPsychicApp(
  command: 'yarn',
  appName: string,
  options: InitPsychicAppCliOptions
) {
  await newPsychicApp(appName, options)

  await sspawn(`cd howyadoin${apiOnlyOptions(options) ? '' : '/api'} &&
${command} psy g:model User email:string &&
NODE_ENV=test ${command} psy db:migrate`)
}
