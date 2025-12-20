import * as path from 'node:path'
import psyCmdForInitOptions from '../../src/helpers/init/psyCmdForInitOptions.js'
import initPsychicApp from '../../src/helpers/initPsychicApp.js'
import { InitPsychicAppCliOptions } from '../../src/helpers/newPsychicApp.js'
import sspawn from '../../src/helpers/sspawn.js'
import expectFile from './expectFile.js'

export default async function initSpecPsychicApp(appName: string, options: InitPsychicAppCliOptions) {
  await sspawn(
    `npx create-next-app@latest howyadoin --eslint --app --ts --skip-install --use-${options.packageManager} --yes --disable-git --webpack --no-tailwind --src-dir`,
  )

  await initPsychicApp(appName, options)
  await expectFile(path.join('howyadoin', options.confPath, 'dream.ts'))

  const psyOrDreamCmd = psyCmdForInitOptions(options)

  await sspawn(`cd howyadoin &&
  ${psyOrDreamCmd} g:model User email:string &&
  NODE_ENV=test ${psyOrDreamCmd} db:migrate`)
}
