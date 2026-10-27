import DockerComposeBuilder from '../../../src/file-builders/docker/DockerComposeBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

// Not `howyadoin`: every generation spec names its app that, and the compose file used to
// hard-code `howyadoin_development` as its database, so only another name shows the file
// following the app it was generated for.
const APP_NAME = 'bear-bnb'

const baseOptions: NewPsychicAppCliOptions = {
  packageManager: 'pnpm',
  workers: false,
  websockets: false,
  claudePsychicSkill: false,
  agentsPsychicSkill: false,
  client: 'none',
  adminClient: 'none',
  internalClient: 'none',
  primaryKeyType: 'bigint',
}

const bunOptions: NewPsychicAppCliOptions = { ...baseOptions, runtime: 'bun', packageManager: 'bun' }

describe('DockerComposeBuilder', () => {
  describe('.build', () => {
    context('a Bun app with websockets, workers and a client', () => {
      let yml: string

      beforeAll(async () => {
        yml = await DockerComposeBuilder.build(APP_NAME, {
          ...bunOptions,
          websockets: true,
          workers: true,
          client: 'react',
        })
      })

      it('installs with `bun install`, then runs the api scripts with `bun run`', () => {
        expect(yml).toContain(
          '    command: sh -c "bun install && bun run psy db:migrate --skip-sync && bun run psy db:seed && bun run web:dev"\n',
        )
      })

      it('runs the websocket and worker processes with `bun run`', () => {
        expect(yml).toContain('    command: sh -c "bun run ws:dev"\n')
        expect(yml).toContain('    command: sh -c "bun run worker:dev"\n')
      })

      it("runs the client's own `dev` script, which every client scaffold defines, on every interface", () => {
        expect(yml).toContain('    command: sh -c "bun install && bun run dev --host 0.0.0.0 --port 3000"\n')
      })

      it("publishes the client's development port, the one the app's development CORS_HOSTS allows", () => {
        expect(yml).toContain("    ports:\n      - '3000:3000'\n")
        expect(yml).not.toContain('3050')
      })

      it("creates the app's own development database", () => {
        expect(yml).toContain('      POSTGRES_DB: bear_bnb_development\n')
        expect(yml).not.toContain('howyadoin')
      })
    })

    context('each package manager', () => {
      it.each([
        ['npm', 'npm install && npm run psy', 'npm install && npm run dev -- --host 0.0.0.0 --port 3000'],
        ['pnpm', 'pnpm install && pnpm psy', 'pnpm install && pnpm dev --host 0.0.0.0 --port 3000'],
        ['yarn', 'yarn install && yarn psy', 'yarn install && yarn dev --host 0.0.0.0 --port 3000'],
        ['bun', 'bun install && bun run psy', 'bun install && bun run dev --host 0.0.0.0 --port 3000'],
      ] as const)(
        'runs `install` as a %s command, never as a package.json script',
        async (packageManager, apiStart, clientCommand) => {
          const yml = await DockerComposeBuilder.build(APP_NAME, {
            ...baseOptions,
            packageManager,
            ...(packageManager === 'bun' ? { runtime: 'bun' } : {}),
            client: 'vue',
          })

          expect(yml).not.toMatch(/run install/)
          expect(yml).toContain(`    command: sh -c "${apiStart} db:migrate --skip-sync`)
          expect(yml).toContain(`    command: sh -c "${clientCommand}"\n`)
          expect(yml).toContain('      POSTGRES_DB: bear_bnb_development\n')
        },
      )
    })

    context('each client framework', () => {
      it.each([
        ['react', '--host 0.0.0.0 --port 3000'],
        ['vue', '--host 0.0.0.0 --port 3000'],
        ['nuxt', '--host 0.0.0.0 --port 3000'],
        ['nextjs', '--hostname 0.0.0.0 --port 3000'],
      ] as const)('passes the %s dev server its own host and port flags', async (client, flags) => {
        const yml = await DockerComposeBuilder.build(APP_NAME, { ...baseOptions, client })

        expect(yml).toContain(`    command: sh -c "pnpm install && pnpm dev ${flags}"\n`)
        expect(yml).toContain("    ports:\n      - '3000:3000'\n")
      })
    })

    context('a Deno app with a client', () => {
      it("runs the client with the client's package manager, pnpm, not with deno", async () => {
        const yml = await DockerComposeBuilder.build(APP_NAME, {
          ...baseOptions,
          runtime: 'deno',
          packageManager: 'deno',
          client: 'nextjs',
        })

        expect(yml).toContain('    command: sh -c "deno install && deno task psy db:migrate --skip-sync')
        expect(yml).toContain(
          '    command: sh -c "pnpm install && pnpm dev --hostname 0.0.0.0 --port 3000"\n',
        )
      })
    })
  })
})
