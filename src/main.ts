#!/usr/bin/env node

// nice reference for shell commands:
// https://www.freecodecamp.org/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/
// commanderjs docs:
// https://github.com/tj/commander.js#quick-start

import { Command } from 'commander'
import yarncmd from './yarncmd'
import dreamcmd from './dreamcmd'
import newPsychicApp from './newPsychicApp'
import sspawn from './sspawn'

const program = new Command()

program
  .command('new')
  .description('create a new psychic app')
  .argument('<name>', 'name of the app you want to create')
  .option('--api', 'specifies apiOnly flag in app, omits client app')
  .option('--ws', 'indicate that you would like to have psychic provide a lean socket.io provider for you')
  .option(
    '--redis',
    'indicate that you would like to have psychic provide a lean redis client. This is used for performing background jobs, but can also be exploited for other queue operations.'
  )
  .option(
    '--uuids',
    'indicate that you would like to have psychic provide a lean redis client. This is used for performing background jobs, but can also be exploited for other queue operations.'
  )
  .action(newPsychicApp)

program
  .command('clean')
  .description('create a controller, model, migration, and serializer for a resource')
  .argument('<name>', 'name of the resource')
  .action(async () => {
    await sspawn('yarn psy clean')
  })

program
  .command('generate:resource')
  .alias('g:resource')
  .description('create a controller, model, migration, and serializer for a resource')
  .argument('<name>', 'name of the resource')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn psy g:resource ${args.join(' ')}`)
  })

program
  .command('generate:controller')
  .alias('g:controller')
  .description('g:controller <name> [...methods] create a new psychic controller')
  .argument('<name>', 'name of the controller')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn psy g:controller ${args.join(' ')}`)
  })

program
  .command('generate:serializer')
  .alias('g:serializer')
  .description('g:serializer <name> [...attributes] create a new psychic serializer')
  .argument('<name>', 'name of the serializer')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn psy g:serializer ${args.join(' ')}`)
  })

program
  .command('generate:model')
  .alias('g:model')
  .description('g:model <name> [...attributes] create a new dream model')
  .argument('<name>', 'name of the model')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn dream g:model ${args.join(' ')}`)
  })

program
  .command('generate:migration')
  .alias('g:migration')
  .description('g:migration <name> create a new dream migration')
  .argument('<name>', 'name of the migration')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn dream g:migration ${args.join(' ')}`)
  })

program
  .command('routes')
  .alias('routes:list')
  .description('lists the routes known by your application')
  .action(async () => {
    await sspawn(`yarn psy routes`)
  })

program
  .command('console')
  .alias('c')
  .description('enters a command line repl')
  .action(async () => {
    await sspawn(`yarn console`)
  })

program
  .command('spec')
  .description('runs either a feauture spec, unit spec, or all specs, depending on what is passed.')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn psy spec ${args.join(' ')}`)
  })

program
  .command('db:rollback')
  .description('db:rollback rolls back the migration')
  .option('--step <integer>', '--step <integer> number of steps back to travel')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn dream db:rollback ${args.join(' ')}`)
  })

program
  .command('db:reset')
  .description('db:rollback rolls back the migration')
  .action(async () => {
    const [_, ...args] = program.args
    await sspawn(`yarn dream db:reset ${args.join(' ')}`)
  })

dreamcmd(program, 'db:create', 'creates the database')
dreamcmd(program, 'db:drop', 'drops the database')
dreamcmd(program, 'db:migrate', 'runs migrations')
dreamcmd(program, 'db:seed', 'seeds your database')
yarncmd(program, 'dev', 'starts the local dev server')
yarncmd(program, 'db', 'starts the local dev server')
yarncmd(program, 'build', 'builds typescript project')
yarncmd(program, 'prod', 'launches production server')
yarncmd(program, 'g:migration', 'generates a new migration')
yarncmd(program, 'uspec', 'runs unit specs')
yarncmd(program, 'fspec', 'runs feature specs')
yarncmd(program, 'console', 'starts repl')
yarncmd(program, 'c', 'starts repl (alias for console)')

program.parse()
