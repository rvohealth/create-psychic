import resolveCliArgv from '../../../src/helpers/resolveCliArgv.js'

describe('resolveCliArgv', () => {
  context('with an explicit `new` subcommand', () => {
    it('forwards the subcommand without duplicating it', () => {
      // `npx @rvoh/create-psychic new bearbnb` => [node, bin, 'new', 'bearbnb']
      expect(resolveCliArgv(['node', 'bin', 'new', 'bearbnb'])).toEqual(['', '', 'new', 'bearbnb'])
    })

    it('preserves options passed after the subcommand', () => {
      expect(resolveCliArgv(['node', 'bin', 'new', 'bearbnb', '--package-manager', 'pnpm'])).toEqual([
        '',
        '',
        'new',
        'bearbnb',
        '--package-manager',
        'pnpm',
      ])
    })
  })

  context('with an explicit `init` subcommand', () => {
    it('forwards the subcommand without duplicating it', () => {
      expect(resolveCliArgv(['node', 'bin', 'init', 'bearbnb'])).toEqual(['', '', 'init', 'bearbnb'])
    })
  })

  context('with no subcommand', () => {
    it('defaults to `new`', () => {
      // `npx @rvoh/create-psychic bearbnb` => [node, bin, 'bearbnb']
      expect(resolveCliArgv(['node', 'bin', 'bearbnb'])).toEqual(['', '', 'new', 'bearbnb'])
    })

    it('defaults to `new` and preserves options', () => {
      expect(resolveCliArgv(['node', 'bin', 'bearbnb', '--no-workers'])).toEqual([
        '',
        '',
        'new',
        'bearbnb',
        '--no-workers',
      ])
    })
  })
})
