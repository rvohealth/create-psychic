import apiOnlyOptions from '../../src/helpers/apiOnlyOptions.js'
import newPsychicApp, { NewPsychicAppCliOptions } from '../../src/helpers/newPsychicApp.js'
import runCmdForPackageManager from '../../src/helpers/runCmdForPackageManager.js'
import sspawn from '../../src/helpers/sspawn.js'
import expectFile from './expectFile.js'

export default async function newSpecPsychicApp(appName: string, options: NewPsychicAppCliOptions) {
  await newPsychicApp(appName, options)
  await expectFile('./howyadoin/README.md')

  const command = runCmdForPackageManager(options.packageManager)

  await sspawn(`cd howyadoin${apiOnlyOptions(options) ? '' : '/api'} &&
${command} psy g:model User email:string &&
NODE_ENV=test ${command} psy db:migrate`)
}
