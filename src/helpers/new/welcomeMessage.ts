import c from 'yoctocolors'
import { PsychicPackageManager } from '../newPsychicApp.js'
import runCmdForPackageManager from '../runCmdForPackageManager.js'

export default function welcomeMessage(apiRoot: string, packageManager: PsychicPackageManager) {
  const runCmd = runCmdForPackageManager(packageManager)

  return `
  ${c.gray(c.bold(c.italic(`Welcome to Psychic! cd into ${c.magenta(apiRoot)} to get started`)))}

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
    `$ ${runCmd} psy g:resource api/v1/users user organization:belongs_to favorites:enum:favorite_foods:Chalupas,Other`,
  )}

  ${c.gray(`to create a model`)}
  ${c.magentaBright(
    `$ ${runCmd} psy g:model user organization:belongs_to likes_chalupas:boolean some_id:uuid`,
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
    `
}
