import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import addClientApp from '../../../src/helpers/addClientApp.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../src/helpers/sspawn.js'
import DreamCliLogger from '../../../src/logger/DreamCliLogger.js'

vi.mock('../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

describe('addClientApp', () => {
  let parentWithSpace: string
  let clientRoot: string

  beforeEach(() => {
    parentWithSpace = fs.mkdtempSync(path.join(os.tmpdir(), 'psychic parent '))
    vi.spyOn(process, 'cwd').mockReturnValue(parentWithSpace)

    // what `create vite` leaves behind, since sspawn is mocked
    clientRoot = path.join(parentWithSpace, 'howyadoin', 'client')
    fs.mkdirSync(clientRoot, { recursive: true })
    fs.writeFileSync(path.join(clientRoot, 'vite.config.ts'), 'export default defineConfig({})\n')
    fs.writeFileSync(path.join(clientRoot, '.gitignore'), 'node_modules\n')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(parentWithSpace, { recursive: true, force: true })
  })

  async function addReactClient(packageManager: NewPsychicAppCliOptions['packageManager']) {
    await addClientApp({
      client: 'react',
      clientRootFolderName: 'client',
      rootPath: './howyadoin',
      appName: 'howyadoin',
      options: {
        packageManager,
        primaryKeyType: 'bigint',
        client: 'react',
        adminClient: 'none',
        internalClient: 'none',
        workers: false,
        websockets: false,
        claudePsychicSkill: false,
        agentsPsychicSkill: false,
      },
      logger: new DreamCliLogger(),
      sourceColor: 'magenta',
      port: 3000,
    })

    return vi.mocked(sspawn).mock.calls
  }

  function expectNoPathInCommands(calls: Awaited<ReturnType<typeof addReactClient>>) {
    for (const [command] of calls) {
      expect(command).not.toContain('howyadoin')
      expect(command).not.toContain(parentWithSpace)
      expect(command).not.toMatch(/\bcd\b/)
    }
  }

  it('scaffolds from the app folder and installs in the client folder, both through `cwd`', async () => {
    const calls = await addReactClient('pnpm')

    expect(calls.map(([command, spawnOptions]) => [command, (spawnOptions as { cwd: string }).cwd])).toEqual([
      ['pnpm create vite@9.0.7 client --template react-ts', './howyadoin'],
      ['pnpm install', clientRoot],
    ])
    expectNoPathInCommands(calls)
  })

  it('sets up yarn inside the client folder through `cwd` before installing there', async () => {
    const calls = await addReactClient('yarn')

    expect(calls.map(([command, spawnOptions]) => [command, (spawnOptions as { cwd: string }).cwd])).toEqual([
      ['npx create-vite@9.0.7 client --template react-ts', './howyadoin'],
      [
        'touch yarn.lock && (yarn --version >/dev/null 2>&1 || corepack enable yarn) && yarn set version stable',
        clientRoot,
      ],
      ['touch yarn.lock && yarn install', clientRoot],
    ])
    expectNoPathInCommands(calls)
  })

  // Outside corepack, `yarn set version stable` records the release it fetched as
  // `yarnPath` in .yarnrc.yml, and a global Yarn 1 hands the install to that
  // release only while the key is still there.
  it('keeps the yarnPath that `yarn set version stable` adds to the client .yarnrc.yml until the install', async () => {
    let yarnrcAtInstall: string | undefined
    vi.mocked(sspawn).mockImplementation((command, spawnOptions) => {
      const yarnrcPath = path.join(spawnOptions?.cwd ?? '', '.yarnrc.yml')
      if (command.includes('yarn set version stable')) {
        fs.appendFileSync(yarnrcPath, 'yarnPath: .yarn/releases/yarn-4.18.1.cjs\n')
      }
      if (command.includes('yarn install')) yarnrcAtInstall = fs.readFileSync(yarnrcPath, 'utf8')
      return Promise.resolve({})
    })

    await addReactClient('yarn')

    expect(yarnrcAtInstall).toContain('yarnPath: .yarn/releases/yarn-4.18.1.cjs')
    expect(yarnrcAtInstall).toContain('nodeLinker: node-modules')
    expect(yarnrcAtInstall).toContain('npmMinimalAgeGate: 4320')
  })
})
