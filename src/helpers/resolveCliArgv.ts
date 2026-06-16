const knownCommands = ['new', 'init'] as const

/**
 * Builds the argv array handed to commander's `program.parse`.
 *
 * When create-psychic is invoked as a bin (e.g. `npx @rvoh/create-psychic new my-app`),
 * `process.argv` is `[node, binPath, ...userArgs]`. We replace the first two entries with
 * empty strings (commander ignores them) and forward the user args.
 *
 * If the user did not pass a known subcommand, we default to `new` so that
 * `create-psychic my-app` behaves like `create-psychic new my-app`. Critically, when the
 * user DID pass `new`/`init` explicitly, we must NOT inject it again — doing so passes the
 * subcommand to itself as a positional argument ("too many arguments for 'new'").
 */
export default function resolveCliArgv(argv: string[]): string[] {
  const userArgs = argv.slice(2)
  const maybeCommand = userArgs.at(0)
  const hasExplicitCommand = knownCommands.includes(maybeCommand as (typeof knownCommands)[number])

  return [
    '', // override the name of the executed script (i.e. ~/.nodenv/versions/20.9.0/bin/node)
    '', // override the name of the file being called (i.e. create-psychic/src/bin.ts)
    ...(hasExplicitCommand ? [] : ['new']), // default to `new` only when no subcommand was provided
    ...userArgs,
  ]
}
