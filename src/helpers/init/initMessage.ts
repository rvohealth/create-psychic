import * as path from 'node:path'
import c from 'yoctocolors'
import { InitPsychicAppCliOptions } from '../newPsychicApp.js'
import runCmdForPackageManager from '../runCmdForPackageManager.js'

export default function initMessage(options: InitPsychicAppCliOptions) {
  const runCmd = runCmdForPackageManager(options.packageManager)

  return `
  ${c.gray(c.bold(c.italic(`Psychic has been successfully initialized into your application`)))}

  ${c.gray(`to create a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development ${runCmd} psy db:create`)}
  ${c.magentaBright(`$ NODE_ENV=test ${runCmd} psy db:create`)}

  ${c.gray(`to migrate a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development ${runCmd} psy db:migrate`)}
  ${c.magentaBright(`$ NODE_ENV=test ${runCmd} psy db:migrate`)}

  ${c.gray(`to rollback a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development ${runCmd} psy db:rollback`)}
  ${c.magentaBright(`$ NODE_ENV=test ${runCmd} psy db:rollback --step=1`)}

  ${c.gray(`to drop a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development ${runCmd} psy db:drop`)}
  ${c.magentaBright(`$ NODE_ENV=test ${runCmd} psy db:drop`)}

  ${c.gray(`to create a resource (model, migration, serializer, and controller)`)}
  ${c.magentaBright(
    `$ ${runCmd} psy g:resource api/v1/users user organization:belongs_to favorites:enum:favorite_foods:Chalupas,Other`
  )}

  ${c.gray(`to create a model`)}
  ${c.magentaBright(
    `$ ${runCmd} psy g:model user organization:belongs_to likes_chalupas:boolean some_id:uuid`
  )}

  ${c.gray(`to create a migration`)}
  ${c.magentaBright(`$ ${runCmd} psy g:migration create-users`)}

  ${c.gray(`to start a dev server at http://localhost:7777,`)}
  ${c.magentaBright(`$ ${runCmd} dev`)}

  ${c.gray(`to run unit tests,`)}
  ${c.magentaBright(`$ ${runCmd} uspec`)}

  ${c.gray(`to run feature tests,`)}
  ${c.magentaBright(`$ ${runCmd} fspec`)}

  # NOTE: before you get started, be sure to visit your ${c.magenta('.env')} and ${c.magenta('.env.test')}
  # files and make sure they have database credentials set correctly.
  # you can see conf/dream.ts to see how those credentials are used.

  # ${c.red('********************************* IMPORTANT *********************************')}
  # If you have opted into a path nesting which is unexpected by the psychic
  # init provisioner, you may need to adjust the path to your src folder, like so:

    ${c.gray('// src/nested/folders/conf/system/srcPath.ts')}

    ...
    export default function srcPath(...paths: string[]) {
      const pathToSrc = join(finalDirname, '..', '..', '..', '..')
      ...

  # in your app, this file can be found at:

      ${c.gray(path.join(options.confPath, 'system', 'srcPath.ts'))}

  # this path needs to be the path to the literal 'src' folder, or whichever
  # folder will be at the root of your project, housing all of your typescript code.
  # It should not be the path to the project root, unless there is no src folder
  # for your app. For Psychic, we recommend you have a src directory.

  # ${c.red('********************************* IMPORTANT *********************************')}
  # In order for dream and/or psychic to operate, the following must be set in your tsconfig
  # 'compilerOptions' block:

      "strictPropertyInitialization": false,
    `
}
