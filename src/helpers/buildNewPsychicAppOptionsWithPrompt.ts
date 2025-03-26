import {
  cliClientAppTypes,
  cliPrimaryKeyTypes,
  InitPsychicAppCliOptions,
  psychicPackageManagers,
} from './newPsychicApp.js'
import Select from './select.js'

export default async function buildNewPsychicAppOptionsWithPrompt(options: InitPsychicAppCliOptions) {
  if (!options.packageManager || !psychicPackageManagers.includes(options.packageManager)) {
    const answer = await new Select(
      'what package manager would you like to use?',
      psychicPackageManagers
    ).run()
    options.packageManager = answer
  }

  if (!options.primaryKeyType || !cliPrimaryKeyTypes.includes(options.primaryKeyType)) {
    const answer = await new Select('what primary key type would you like to use?', cliPrimaryKeyTypes).run()
    options.primaryKeyType = answer
  }

  let monoRepo = false
  if (!options.client && !options.adminClient) {
    const answer = await new Select(
      `Would you like a monorepo?\nFor more info, see https://psychicframework.com/docs/monorepo`,
      ['yes', 'no'] as const
    ).run()
    monoRepo = answer === 'yes'
  }

  if (monoRepo) {
    if (!options.client || !cliClientAppTypes.includes(options.client)) {
      const answer = await new Select(
        'which front end client would you like to use?',
        cliClientAppTypes
      ).run()
      options.client = answer
    }

    if (!options.adminClient || !cliClientAppTypes.includes(options.adminClient)) {
      const answer = await new Select(
        'which front end client would you like to use for your admin app?',
        cliClientAppTypes
      ).run()
      options.adminClient = answer
    }
  } else {
    // if they explicitly provide clients, we do not want to override, so we use ||=
    options.client ||= 'none'
    options.adminClient ||= 'none'
  }

  if (options.workers === undefined) {
    const answer = await new Select('background workers?', ['yes', 'no'] as const).run()
    options.workers = answer === 'yes'
  }

  if (options.websockets === undefined) {
    const answer = await new Select('websockets?', ['no', 'yes'] as const).run()
    options.websockets = answer === 'yes'
  }
}
