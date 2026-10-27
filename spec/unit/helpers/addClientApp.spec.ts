import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import addClientApp from '../../../src/helpers/addClientApp.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'
import sspawn from '../../../src/helpers/sspawn.js'
import DreamCliLogger from '../../../src/logger/DreamCliLogger.js'

vi.mock('../../../src/helpers/sspawn.js', () => ({ default: vi.fn() }))

// create-vite 9.0.7's react-ts and vue-ts templates declare no `engines`
const SCAFFOLDED_PACKAGE_JSON = { name: 'client', private: true, dependencies: { react: '^19.2.0' } }

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
    fs.writeFileSync(path.join(clientRoot, 'package.json'), JSON.stringify(SCAFFOLDED_PACKAGE_JSON))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    fs.rmSync(parentWithSpace, { recursive: true, force: true })
  })

  async function addClient(
    packageManager: NewPsychicAppCliOptions['packageManager'],
    client: 'react' | 'nuxt' = 'react',
  ) {
    await addClientApp({
      client,
      clientRootFolderName: 'client',
      rootPath: './howyadoin',
      appName: 'howyadoin',
      options: {
        packageManager,
        primaryKeyType: 'bigint',
        client,
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

  function captureClientPackageJsonAtInstall(packageManager: NewPsychicAppCliOptions['packageManager']) {
    const captured: { packageJson?: unknown } = {}
    vi.mocked(sspawn).mockImplementation((command, spawnOptions) => {
      if (command.endsWith(`${packageManager} install`) && spawnOptions?.cwd === clientRoot) {
        captured.packageJson = JSON.parse(fs.readFileSync(path.join(clientRoot, 'package.json'), 'utf8'))
      }
      return Promise.resolve({})
    })
    return captured
  }

  function expectNoPathInCommands(calls: Awaited<ReturnType<typeof addClient>>) {
    for (const [command] of calls) {
      expect(command).not.toContain('howyadoin')
      expect(command).not.toContain(parentWithSpace)
      expect(command).not.toMatch(/\bcd\b/)
    }
  }

  it('scaffolds from the app folder and installs in the client folder, both through `cwd`', async () => {
    const calls = await addClient('pnpm')

    expect(calls.map(([command, spawnOptions]) => [command, (spawnOptions as { cwd: string }).cwd])).toEqual([
      ['pnpm create vite@9.0.7 client --template react-ts', './howyadoin'],
      ['pnpm install', clientRoot],
    ])
    expectNoPathInCommands(calls)
  })

  // ESLint 10 reads only the scaffold's flat eslint.config.js, and lints a
  // `.eslintrc.cjs` beside it as source, so such a file configures nothing
  it('writes no .eslintrc.cjs into a React client', async () => {
    await addClient('pnpm')

    expect(fs.existsSync(path.join(clientRoot, '.eslintrc.cjs'))).toBe(false)
  })

  it('sets up yarn inside the client folder through `cwd` before installing there', async () => {
    const calls = await addClient('yarn')

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

  // A pnpm client is its own pnpm project, so the api's `engines.pnpm` never
  // applies there. Without the same floor, a pnpm older than 10.16 adds or
  // updates a client dependency while ignoring the client's 3-day cooldown.
  it("declares the api's pnpm floor in a pnpm client's package.json before installing there", async () => {
    const captured = captureClientPackageJsonAtInstall('pnpm')

    await addClient('pnpm')

    expect(captured.packageJson).toEqual({ ...SCAFFOLDED_PACKAGE_JSON, engines: { pnpm: '>=10.19.0' } })
    expect(fs.readFileSync(path.join(clientRoot, 'package.json'), 'utf8')).toMatch(/\n$/)
  })

  it("keeps the engines a scaffolder declared in a pnpm client's package.json", async () => {
    fs.writeFileSync(
      path.join(clientRoot, 'package.json'),
      JSON.stringify({ ...SCAFFOLDED_PACKAGE_JSON, engines: { node: '>=20' } }),
    )
    const captured = captureClientPackageJsonAtInstall('pnpm')

    await addClient('pnpm')

    expect((captured.packageJson as { engines: unknown }).engines).toEqual({
      node: '>=20',
      pnpm: '>=10.19.0',
    })
  })

  it.each(['yarn', 'npm', 'bun'] as const)(
    "leaves a %s client's package.json as scaffolded",
    async packageManager => {
      const captured = captureClientPackageJsonAtInstall(packageManager)

      await addClient(packageManager)

      expect(captured.packageJson).toEqual(SCAFFOLDED_PACKAGE_JSON)
    },
  )

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

    await addClient('yarn')

    expect(yarnrcAtInstall).toContain('yarnPath: .yarn/releases/yarn-4.18.1.cjs')
    expect(yarnrcAtInstall).toContain('nodeLinker: node-modules')
    expect(yarnrcAtInstall).toContain('npmMinimalAgeGate: 4320')
  })

  // nuxt/starter moves these floors to each new release within hours of it
  // shipping, so under the client's 3-day cooldown no release would meet them.
  it.each(['pnpm', 'yarn'] as const)(
    'widens the Nuxt starter floors to their major range before a %s client installs',
    async packageManager => {
      let packageJsonAtInstall: unknown
      vi.mocked(sspawn).mockImplementation((command, spawnOptions) => {
        const packageJsonPath = path.join(clientRoot, 'package.json')
        // what `nuxi init --template minimal` leaves behind
        if (command.includes('nuxi@latest init')) {
          fs.writeFileSync(
            packageJsonPath,
            JSON.stringify({
              dependencies: { nuxt: '^4.6.3', vue: '^3.5.44', 'vue-router': '^5.4.0' },
            }),
          )
        }
        if (command.endsWith(`${packageManager} install`) && spawnOptions?.cwd === clientRoot) {
          packageJsonAtInstall = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        }
        return Promise.resolve({})
      })

      await addClient(packageManager, 'nuxt')

      expect((packageJsonAtInstall as { dependencies: unknown }).dependencies).toEqual({
        nuxt: '^4.0.0',
        vue: '^3.0.0',
        'vue-router': '^5.0.0',
      })
    },
  )
})
