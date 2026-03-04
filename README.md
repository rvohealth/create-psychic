# Psychic cli

This repo houses the cli tool used to provision new psychic apps.

## Specs

To run specs:

```console
DEBUG=1 pnpm spec
# OR, to run a specific spec
DEBUG=1 pnpm spec spec/unit/initPsychicApp/basic.spec.ts
```

## Testing

To test the new app builder, you can run `pnpm psy new myapp` from within the project directory.

## Troubleshooting

When a spec fails, troubleshoot by opening the spec file and starting to wrap different commands with `console.debug` logs. E.g.:

```typescript
console.debug('111111111111111111111111111111111111111111111111')
await initSpecPsychicApp('howyadoin', {
  ...initPsychicAppDefaults(),
  dreamOnly: true,
})
console.debug('222222222222222222222222222222222222222222222222')
```

If the second one doesn't print, command-click into the function and move your debug lines to commands within that function. Do that until you isolate the exact line that is failing.

Once you have identified the failing line, console.log anything that is being executed on the command line (e.g. installing packages or migrating the database), `cd` into the "howyadoin" directory (deleted and recreated when running each spec), and run that command from that directory (or the "howyadoin/api" directory, depending on the test), and that will show you what is breaking.

## Questions?

- **Ask them on [Stack Overflow](https://stackoverflow.com)**, using the `[psychic]` tag.

## Contributing

Psychic is an open source library, so we encourage you to actively contribute. Visit our [Contributing](https://github.com/rvohealth/psychic-cli/CONTRIBUTING.md) guide to learn more about the processes we use for submitting pull requests or issues.

Are you trying to report a possible security vulnerability? Visit our [Security Policy](https://github.com/rvohealth/psychic-cli/SECURITY.md) for guidelines about how to proceed.
