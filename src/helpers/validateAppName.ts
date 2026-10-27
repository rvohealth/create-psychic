import { InvalidArgumentError } from 'commander'

// A letter, then letters of either case, digits, `-` or `_`. The name becomes
// the app's folder, its package.json name, a string in its generated source and,
// snake-cased, its database names, and each of those takes these characters as
// they are: nothing needs quoting or escaping, and Dream's unquoted
// `CREATE DATABASE` never gets an identifier that starts with a digit, which
// Postgres refuses. No length limit, as in Rails.
const APP_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/

/**
 * Commander argument parser for `new <name>`. Returns an allowed name unchanged.
 * Otherwise it throws commander's InvalidArgumentError, so commander prints the
 * message and exits with code 1 before `new` prompts for anything or writes a
 * file.
 *
 * ```ts
 * validateAppName('MyApp') // => 'MyApp'
 * validateAppName('my app') // throws InvalidArgumentError
 * ```
 */
export default function validateAppName(name: string): string {
  if (APP_NAME_PATTERN.test(name)) return name

  throw new InvalidArgumentError(
    'An app name must start with a letter and contain only letters, digits, dashes (-) and underscores (_).',
  )
}
