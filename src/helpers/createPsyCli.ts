import { primaryKeyTypes } from '@rvoh/dream/system'
import { Command } from 'commander'
import initPsychicApp from './initPsychicApp.js'
import newPsychicApp, {
  cliClientAppTypes,
  InitPsychicAppCliOptions,
  NewPsychicAppCliOptions,
  psychicPackageManagers,
} from './newPsychicApp.js'

export default function createPsyCli() {
  const program = new Command()

  program
    .command('new')
    .description('create a new psychic app')
    .argument('<name>', 'name of the app you want to create')
    .option(
      '--package-manager <packageManager>',
      `One of: ${psychicPackageManagers.join(', ')}. The package manager to use`,
    )
    .option('--workers', 'include background workers in your application')
    .option('--no-workers', 'exclude background workers from your application')
    .option('--websockets', 'include websockets in your application')
    .option('--no-websockets', 'exclude websockets from your application')
    .option('--claude-psychic-skill', 'install psychic-skill for Claude Code')
    .option('--no-claude-psychic-skill', 'exclude psychic-skill for Claude Code')
    .option('--codex-psychic-skill', 'install psychic-skill for Codex')
    .option('--no-codex-psychic-skill', 'exclude psychic-skill for Codex')

    .option(
      '--primary-key-type <KEY_TYPE>',
      `One of: ${primaryKeyTypes.join(
        ', ',
      )}. The type of primary key to use by default when generating Dream models (can be changed by hand in the migration file)`,
    )

    .option(
      '--client <CLIENT_APP_TYPE>',
      `One of: ${cliClientAppTypes.join(', ')}. The type of client app to create`,
    )
    .option(
      '--admin-client <CLIENT_APP_TYPE>',
      `One of: ${cliClientAppTypes.join(', ')}. The type of admin client app to create`,
    )
    .option(
      '--internal-client <CLIENT_APP_TYPE>',
      `One of: ${cliClientAppTypes.join(', ')}. The type of internal client app to create`,
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
    .option('--no-workers', 'exclude background workers from your application')
    .option('--websockets', 'include websockets in your application')
    .option('--no-websockets', 'exclude websockets from your application')
    .option('--claude-psychic-skill', 'install psychic-skill for Claude Code')
    .option('--no-claude-psychic-skill', 'exclude psychic-skill for Claude Code')
    .option('--codex-psychic-skill', 'install psychic-skill for Codex')
    .option('--no-codex-psychic-skill', 'exclude psychic-skill for Codex')
    .option(
      '--primary-key-type <KEY_TYPE>',
      `One of: ${primaryKeyTypes.join(
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
      '--import-extension <extension>',
      'the import extension you are using for your import suffixes (.js, .ts, or none)',
    )
    .option('--openapi-path <path>', 'the path to your openapi directory')
    .option('--utils-path <path>', 'the path to your utils directory')
    .option('--executables-path <path>', 'the path to your top-level executables')
    .option('--serializers-path <path>', 'the path to your serializers directory')
    .option('--conf-path <path>', 'the path to your conf directory')
    .option('--models-path <path>', 'the path to your models directory')
    .option('--controllers-path <path>', 'the path to your controllers directory')
    .option('--services-path <path>', 'the path to your services directory')
    .option('--factories-path <path>', 'the path to your spec factories directory')
    .option('--model-specs-path <path>', 'the path to your model specs directory')
    .option('--controller-specs-path <path>', 'the path to your controller specs directory')
    .action(async (name: string, options: InitPsychicAppCliOptions) => {
      await initPsychicApp(name, options)
    })
  return program
}
