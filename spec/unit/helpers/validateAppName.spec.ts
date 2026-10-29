import { InvalidArgumentError } from 'commander'
import validateAppName from '../../../src/helpers/validateAppName.js'

describe('validateAppName', () => {
  it.each(['MyApp', 'my-app', 'my_app2', 'howyadoin', 'a'])('accepts %j unchanged', name => {
    expect(validateAppName(name)).toEqual(name)
  })

  it.each([
    '',
    '3d-shop',
    '-app',
    '_app',
    'my.app',
    'my app',
    'my/app',
    '../app',
    'app;touch pwned',
    'app && touch pwned',
    'app|cat',
    'app>out',
    'app$(touch pwned)',
    'app`touch pwned`',
    "app'",
    'app"',
    'app\ntouch pwned',
    'café',
  ])('refuses %j, naming the allowed characters', name => {
    expect(() => validateAppName(name)).toThrow(InvalidArgumentError)
    expect(() => validateAppName(name)).toThrow(
      'An app name must start with a letter and contain only letters, digits, dashes (-) and underscores (_).',
    )
  })
})
