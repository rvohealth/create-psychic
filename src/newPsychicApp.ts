import * as fs from 'fs'
import * as c from 'colorette'

import ConfBuilder from './confBuilder'
import copyRecursive from './copyRecursive'
import EnvBuilder from './envBuilder'
import sspawn from './sspawn'
import logo from './logo'
import log from './log'
import sleep from './sleep'
import gatherUserInput from './gatherUserInput'
import PackagejsonBuilder from './packagejsonBuilder'
import ViteConfBuilder from './viteConfBuilder'
import ESLintConfBuilder from './eslintConfBuilder'

export default async function newPsychiclApp(appName: string) {
  const userOptions = await gatherUserInput()

  log.clear()
  log.write(logo() + '\n\n', { cache: true })
  log.write(c.green(`Installing psychic framework to ./${appName}`), { cache: true })
  log.write(c.green(`Step 1. writing boilerplate to ${appName}...`))
  let projectPath: string
  let rootPath = `./${appName}`

  if (userOptions.apiOnly) {
    projectPath = `./${appName}`
    copyRecursive(__dirname + '/../boilerplate/api', `./${appName}`)
  } else {
    projectPath = `./${appName}/api`
    fs.mkdirSync(`./${appName}`)
    copyRecursive(__dirname + '/../boilerplate/api', projectPath)
  }

  log.restoreCache()
  log.write(c.green(`Step 1. write boilerplate to ${appName}: Done!`), { cache: true })
  log.write(c.green(`Step 2. building default config files...`))
  fs.writeFileSync(`${projectPath}/.env`, EnvBuilder.build({ appName, env: 'development' }))
  fs.writeFileSync(`${projectPath}/.env.test`, EnvBuilder.build({ appName, env: 'test' }))

  fs.writeFileSync(
    projectPath + '/src/conf/app.yml',
    ConfBuilder.buildAll({
      api: userOptions.apiOnly,
      ws: userOptions.ws,
      redis: userOptions.redis,
      uuids: userOptions.useUuids,
    })
  )

  fs.writeFileSync(projectPath + '/package.json', await PackagejsonBuilder.buildAPI(userOptions))

  log.restoreCache()
  log.write(c.green(`Step 2. build default config files: Done!`), { cache: true })
  log.write(c.green(`Step 3. Installing psychic dependencies...`))
  await sspawn(`cd ${projectPath} && yarn install`)

  // sleeping here because yarn has a delayed print that we need to clean up
  await sleep(1000)

  log.restoreCache()
  log.write(c.green(`Step 3. Install psychic dependencies: Done!`), { cache: true })
  log.write(c.green(`Step 4. Initializing git repository...`))
  await sspawn(`cd ./${appName} && git init`)

  log.restoreCache()
  log.write(c.green(`Step 4. Initialize git repository: Done!`), { cache: true })
  log.write(c.green(`Step 5. Building project...`))

  // don't sync yet, since we need to run migrations first
  // await sspawn(`yarn --cwd=${projectPath} dream sync:existing`)

  const errors: string[] = []
  if (!userOptions.apiOnly) {
    switch (userOptions.client) {
      case 'react':
        await sspawn(`cd ${rootPath} && yarn create vite client --template react-ts && cd client`)

        fs.mkdirSync(`./${appName}/client/src/config`)

        copyRecursive(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`)
        copyRecursive(
          __dirname + '/../boilerplate/client/config/routes.ts',
          `${projectPath}/../client/src/config/routes.ts`
        )
        copyRecursive(
          __dirname + '/../boilerplate/client/node-version',
          `${projectPath}/../client/.node-version`
        )

        fs.writeFileSync(projectPath + '/../client/vite.config.ts', ViteConfBuilder.build(userOptions))
        fs.writeFileSync(projectPath + '/../client/.eslintrc.cjs', ESLintConfBuilder.buildForViteReact())

        break

      case 'vue':
        await sspawn(`cd ${rootPath} && yarn create vite client --template vue-ts`)
        fs.mkdirSync(`./${appName}/client/src/config`)

        copyRecursive(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`)
        copyRecursive(
          __dirname + '/../boilerplate/client/config/routes.ts',
          `${projectPath}/../client/src/config/routes.ts`
        )
        copyRecursive(
          __dirname + '/../boilerplate/client/node-version',
          `${projectPath}/../client/.node-version`
        )

        fs.writeFileSync(projectPath + '/../client/vite.config.ts', ViteConfBuilder.build(userOptions))
        break

      case 'nuxt':
        await sspawn(`cd ${rootPath} && yarn create nuxt-app client`)

        fs.mkdirSync(`./${appName}/client/config`)

        copyRecursive(__dirname + '/../boilerplate/client/api', `${projectPath}/../client/src/api`)
        copyRecursive(
          __dirname + '/../boilerplate/client/config/routes.ts',
          `${projectPath}/../client/config/routes.ts`
        )
        copyRecursive(
          __dirname + '/../boilerplate/client/node-version',
          `${projectPath}/../client/.node-version`
        )

        break
    }

    await sspawn(`cd ${projectPath}/../client && yarn install --ignore-engines`)

    try {
      await sspawn(`cd ${projectPath}/../client && yarn add axios --ignore-engines`)
    } catch (err) {
      errors.push(
        `
          ATTENTION:
            we attempted to install axios for you in your client folder,
            but it failed. The error we received was:

        `
      )
      console.error(err)
    }
  }

  await sspawn(`cd ./${appName} && git add --all && git commit -m 'psychic init'`)

  log.restoreCache()
  log.write(c.green(`Step 5. Build project: Done!`), { cache: true })
  const helloMessage = `
${c.green(
  c.bold(
    c.italic(
      `Welcome to Psychic! What fortunes await your futures?\ncd into ${c.magentaBright(
        appName
      )} to find out!`
    )
  )
)}

${c.magenta(`to create a database,`)}
  ${c.magenta(`$ NODE_ENV=development yarn psy db:create`)}
  ${c.magenta(`$ NODE_ENV=test yarn psy db:create`)}

${c.magentaBright(`to migrate a database,`)}
  ${c.magentaBright(`$ NODE_ENV=development yarn psy db:migrate`)}
  ${c.magentaBright(`$ NODE_ENV=test yarn psy db:migrate`)}

${c.redBright(`to rollback a database,`)}
  ${c.redBright(`$ NODE_ENV=development yarn psy db:rollback`)}
  ${c.redBright(`$ NODE_ENV=test yarn psy db:rollback --step=1`)}

${c.blueBright(`to drop a database,`)}
  ${c.blueBright(`$ NODE_ENV=development yarn psy db:drop`)}
  ${c.blueBright(`$ NODE_ENV=test yarn psy db:drop`)}

${c.green(`to create a resource (model, migration, serializer, and controller)`)}
  ${c.green(
    `$ yarn psy g:resource api/v1/users user organization:belongs_to favorites:enum:favorite_foods:Chalupas,Other`
  )}

  # NOTE: doing it this way, you will still need to
  # plug the routes manually in your api/src/app/conf/routes.ts file

${c.greenBright(`to create a model`)}
  ${c.greenBright(`$ yarn psy g:model user organization:belongs_to likes_chalupas:boolean some_id:uuid`)}

${c.yellow(`to create a migration`)}
  ${c.yellow(`$ yarn psy g:migration create-users`)}

${c.yellowBright(`to start a dev server at http://localhost:7777,`)}
  ${c.yellowBright(`$ yarn psy dev`)}

${c.magentaBright(`to run unit tests,`)}
  ${c.magentaBright(`$ yarn psy uspec`)}

${c.magentaBright(`to run feature tests,`)}
  ${c.magentaBright(`$ yarn psy fspec`)}

# NOTE: before you get started, be sure to visit your ${c.magenta('.env')} and ${c.magenta('.env.test')}
# files and make sure they have database credentials set correctly.
# you can see conf/dream.ts to see how those credentials are used.
    `
  console.log(helloMessage)

  errors.forEach(err => {
    console.log(err)
  })
}
