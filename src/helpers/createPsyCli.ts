import { Command } from 'commander'
import newPsychicApp, {
  cliClientAppTypes,
  cliPrimaryKeyTypes,
  InitPsychicAppCliOptions,
  NewPsychicAppCliOptions,
} from './newPsychicApp.js'
import initPsychicApp from './initPsychicApp.js'

export default function createPsyCli() {
  const program = new Command()

  program
    .command('new')
    .description('create a new psychic app')
    .argument('<name>', 'name of the app you want to create')
    .option('--workers', 'include background workers in your application')
    .option('--websockets', 'include websockets in your application')

    .option(
      '--primary-key-type <KEY_TYPE>',
      `One of: ${cliPrimaryKeyTypes.join(
        ', ',
      )}. The type of primary key to use by default when generating Dream models (can be changed by hand in the migration file)`,
    )

    .option(
      '--client <CLIENT_APP_TYPE>',
      `One of: ${cliClientAppTypes.join(', ')}. The type of client app to create`,
    )

    .action(async (name: string, options: NewPsychicAppCliOptions) => {
      await newPsychicApp(name, options)
    })

  program
    .command('init')
    .description('initialize psychic and/or dream into an existing typescript application')
    .argument(
      '<name>',
      'name of the app you want to create. This will be used for naming db credentials, etc...',
    )
    .option('--workers', 'include background workers in your application')
    .option('--websockets', 'include websockets in your application')
    .option(
      '--primary-key-type <KEY_TYPE>',
      `One of: ${cliPrimaryKeyTypes.join(
        ', ',
      )}. The type of primary key to use by default when generating Dream models (can be changed by hand in the migration file)`,
    )
    .option('--package-manager <packageManager>', 'the package manager you are using')
    .option('--db-path <path>', 'the path to your db directory')
    .option(
      '--types-path <path>',
      'the path to your types directory (used by dream and psychic to store type metadata)',
    )
    .option('--template <template>', 'the template you would like to use (nextjs or none)')
    .option('--dream-only', 'if provided')
    .option(
      '--import-style <style>',
      'the import style you are using for your import suffixes (.js, .ts, or none)',
    )
    .option('--openapi-path <path>', 'the path to your openapi directory')
    .option('--utils-path <path>', 'the path to your utils directory')
    .option('--executables-path <path>', 'the path to your top-level executables')
    .option('--serializers-path <path>', 'the path to your serializers directory')
    .option(
      '--types-path <path>',
      'the path to the internal types directory used to store psychic and dream types',
    )
    .option('--system-files-path <path>', 'the path to your system directory')
    .option('--conf-path <path>', 'the path to your controllers directory')
    .option('--models-path <path>', 'the path to your models directory')
    .option('--controllers-path <path>', 'the path to your controllers directory')
    .option('--services-path <path>', 'the path to your services directory')
    .option('--factories-path <path>', 'the path to your controllers directory')
    .option('--model-specs-path <path>', 'the path to your controllers directory')
    .option('--controller-specs-path <path>', 'the path to your controllers directory')
    .action(async (name: string, options: InitPsychicAppCliOptions) => {
      await initPsychicApp(name, options)
    })
  return program
}
