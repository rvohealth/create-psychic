import { primaryKeyTypes } from '@rvoh/dream/system'
import {
  cliClientAppTypes,
  NewPsychicAppCliOptions,
  psychicPackageManagers,
  selectablePsychicRuntimes,
} from '../newPsychicApp.js'
import Select from '../select.js'

export default async function buildNewPsychicAppOptionsWithPrompt(options: NewPsychicAppCliOptions) {
  // Runtime is chosen first; for deno/bun it subsumes the package-manager prompt
  // (each is its own toolchain). Skip the prompt in the spec suite (no TTY) — a
  // prompted-but-unset Select would hang the suite.
  if (
    options.runtime === undefined ||
    !(selectablePsychicRuntimes as readonly string[]).includes(options.runtime)
  ) {
    if (process.env.NODE_ENV === 'test') {
      options.runtime = 'node'
    } else {
      options.runtime = await new Select(
        'which runtime would you like to target?',
        selectablePsychicRuntimes,
      ).run()
    }
  }

  if (options.runtime === 'node') {
    if (
      !options.packageManager ||
      !(psychicPackageManagers as readonly string[]).includes(options.packageManager)
    ) {
      const answer = await new Select(
        'which package manager would you like to use?',
        psychicPackageManagers,
      ).run()
      options.packageManager = answer
    }
  } else {
    // deno and bun are their own package managers + runtimes; the runtime choice
    // subsumes the pm prompt and drives the existing pm-keyed machinery.
    options.packageManager = options.runtime
  }

  if (!options.primaryKeyType || !primaryKeyTypes.includes(options.primaryKeyType)) {
    const answer = await new Select(
      'which primary key type would you like to use?',
      primaryKeyTypes,
      primaryKeyTypes.map(keyType => (keyType === 'uuid7' ? '(sortable; requires postgres 18)' : '')),
    ).run()
    options.primaryKeyType = answer
  }

  let monoRepo = false
  if (!options.client && !options.adminClient && !options.internalClient) {
    const answer = await new Select(
      'would you like a monorepo? (https://psychicframework.com/docs/learn-more/monorepos)',
      ['yes', 'no'] as const,
    ).run()
    monoRepo = answer === 'yes'
  }

  if (monoRepo) {
    if (!options.client || !cliClientAppTypes.includes(options.client)) {
      const answer = await new Select(
        'which front end client would you like to use?',
        cliClientAppTypes,
      ).run()
      options.client = answer
    }

    if (!options.adminClient || !cliClientAppTypes.includes(options.adminClient)) {
      const answer = await new Select(
        'which front end client would you like to use for your admin app?',
        cliClientAppTypes,
      ).run()
      options.adminClient = answer
    }

    if (!options.internalClient || !cliClientAppTypes.includes(options.internalClient)) {
      const answer = await new Select(
        'which front end client would you like to use for your internal app?',
        cliClientAppTypes,
      ).run()
      options.internalClient = answer
    }
  } else {
    // if they explicitly provide clients, we do not want to override, so we use ||=
    options.client ||= 'none'
    options.adminClient ||= 'none'
    options.internalClient ||= 'none'
  }

  if (options.workers === undefined) {
    const answer = await new Select('background workers?', ['yes', 'no'] as const).run()
    options.workers = answer === 'yes'
  }

  if (options.websockets === undefined) {
    const answer = await new Select('websockets?', ['yes', 'no'] as const).run()
    options.websockets = answer === 'yes'
  }

  if (options.claudePsychicSkill === undefined && options.agentsPsychicSkill === undefined) {
    const answer = await new Select('AI agent skills?', [
      'Claude Code',
      'Codex (or any agent using .agents/)',
      'both',
      'none',
    ] as const).run()

    options.claudePsychicSkill = answer === 'Claude Code' || answer === 'both'
    options.agentsPsychicSkill = answer === 'Codex (or any agent using .agents/)' || answer === 'both'
  } else {
    options.claudePsychicSkill ??= false
    options.agentsPsychicSkill ??= false
  }

  if (options.githubActions === undefined) {
    // Skip the prompt in the spec suite (no TTY); specs opt in explicitly.
    if (process.env.NODE_ENV === 'test') {
      options.githubActions = false
    } else {
      const answer = await new Select('generate a github actions workflow file?', [
        'yes',
        'no',
      ] as const).run()
      options.githubActions = answer === 'yes'
    }
  }
}
