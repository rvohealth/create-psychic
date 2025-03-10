import { Command } from 'commander'
import newPsychicApp, {
  cliClientAppTypes,
  cliPrimaryKeyTypes,
  InitPsychicAppCliOptions,
} from './newPsychicApp'

export default function createPsyCli() {
  const program = new Command()

  program
    .command('new')
    .description('create a new psychic app')
    .argument('<name>', 'name of the app you want to create')
    .option('--workers', 'include background workers in your application')
    .option('--no-workers', 'omit background workers in your application')
    .option('--websockets', 'include websockets in your application')
    .option('--no-websockets', 'omit websockets in your application')

    .option(
      '--primary-key-type <KEY_TYPE>',
      `One of: ${cliPrimaryKeyTypes.join(
        ', '
      )}. The type of primary key to use by default when generating Dream models (can be changed by hand in the migration file)`
    )

    .option(
      '--client <CLIENT_APP_TYPE>',
      `One of: ${cliClientAppTypes.join(', ')}. The type of client app to create`
    )

    .action(async (name: string, options: InitPsychicAppCliOptions) => {
      await newPsychicApp(name, options)
    })

  return program
}
