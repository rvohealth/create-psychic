import createPsyCli from '../../../src/helpers/createPsyCli.js'
import newPsychicApp from '../../../src/helpers/newPsychicApp.js'

vi.mock('../../../src/helpers/newPsychicApp.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../src/helpers/newPsychicApp.js')>()),
  default: vi.fn(),
}))

// commander exits the process on a parse error; make the `new` subcommand throw
// instead, and keep its error text out of the spec output
function cliThatThrows() {
  const program = createPsyCli()
  const newCommand = program.commands.find(command => command.name() === 'new')
  if (!newCommand) throw new Error('createPsyCli has no `new` command')
  newCommand.exitOverride().configureOutput({ writeErr: () => {} })
  return program
}

describe('createPsyCli', () => {
  describe('new <name>', () => {
    it('passes an allowed name to newPsychicApp as typed', async () => {
      await cliThatThrows().parseAsync(['', '', 'new', 'MyApp', '--package-manager', 'pnpm'])

      expect(vi.mocked(newPsychicApp)).toHaveBeenCalledWith(
        'MyApp',
        expect.objectContaining({ packageManager: 'pnpm' }),
      )
    })

    it('exits non-zero naming the allowed characters, before newPsychicApp prompts or writes anything', async () => {
      const parsing = cliThatThrows().parseAsync(['', '', 'new', 'my app;touch pwned'])

      await expect(parsing).rejects.toThrow('only letters, digits, dashes (-) and underscores (_)')
      await expect(parsing).rejects.toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 })

      expect(vi.mocked(newPsychicApp)).not.toHaveBeenCalled()
    })
  })
})
