import * as path from 'node:path'
import DockerComposeBuilder from '../../../src/file-builders/docker/DockerComposeBuilder.js'
import getApiRoot from '../../../src/helpers/getApiRoot.js'
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

// The services that run the api's own code, built from its Dockerfile.dev
const API_SERVICES = ['api', 'ws', 'worker'] as const

// One entry under a top-level key, from its own line up to the next entry or top-level key,
// so an assertion holds for the service (or volume list) it names and no other.
function block(yml: string, heading: string) {
  const lines = yml.split('\n')
  const start = lines.indexOf(heading)
  if (start === -1) throw new Error(`no "${heading}" line in:\n${yml}`)
  const depth = heading.length - heading.trimStart().length
  const end = lines.findIndex(
    (line, i) => i > start && line.trim() !== '' && line.length - line.trimStart().length <= depth,
  )
  return lines.slice(start, end === -1 ? undefined : end).join('\n') + '\n'
}

function service(yml: string, name: string) {
  return block(yml, `  ${name}:`)
}

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

    context('the db service', () => {
      it("mounts its volume at /var/lib/postgresql, where Postgres 18's image keeps its data", async () => {
        const db = service(await DockerComposeBuilder.build(APP_NAME, baseOptions), 'db')

        expect(db).toContain('    image: postgres:18-alpine\n')
        expect(db).toContain('      - db:/var/lib/postgresql\n')
        // From 18 on, the image's entrypoint exits 1 before initdb when anything is mounted
        // at the old data path, so the db never becomes healthy and nothing waiting on it starts.
        expect(db).not.toContain('/var/lib/postgresql/data')
      })
    })

    context('where the api, websocket and worker services find the api', () => {
      it.each([
        ['an api-only app', {}, '.'],
        ['an app with a client', { client: 'react' }, './api'],
        ['an app with only an admin client', { adminClient: 'react' }, './api'],
        ['an app with only an internal client', { internalClient: 'vue' }, './api'],
      ] as const)(
        'builds and mounts %s from the folder its api is written to',
        async (_, clients, folder) => {
          const options: NewPsychicAppCliOptions = {
            ...baseOptions,
            websockets: true,
            workers: true,
            ...clients,
          }
          // copyApiBoilerplate writes the api and its Dockerfile.dev into getApiRoot, and
          // docker-compose.yml into the app's own folder
          const apiFolder = path.relative(path.join(process.cwd(), APP_NAME), getApiRoot(APP_NAME, options))
          expect(apiFolder === '' ? '.' : `./${apiFolder}`).toEqual(folder)

          const yml = await DockerComposeBuilder.build(APP_NAME, options)

          for (const name of API_SERVICES) {
            expect(service(yml, name)).toContain(`      context: ${folder}\n`)
            expect(service(yml, name)).toContain(`      - ${folder}:/usr/src/app:cached\n`)
          }
        },
      )
    })

    context("the api's node_modules", () => {
      it.each([
        ['an api-only app', {}],
        ['an app with a client', { client: 'react' }],
      ] as const)(
        "mounts one shared volume over it in each api service of %s, so their install never replaces the host's",
        async (_, clients) => {
          const yml = await DockerComposeBuilder.build(APP_NAME, {
            ...baseOptions,
            websockets: true,
            workers: true,
            ...clients,
          })

          for (const name of API_SERVICES) {
            expect(service(yml, name)).toContain('      - api_node_modules:/usr/src/app/node_modules\n')
          }
          expect(block(yml, 'volumes:')).toContain('\n  api_node_modules:\n')
        },
      )
    })

    context('TLS certificate checks', () => {
      it("leaves them on in every service that installs packages or runs the app's code", async () => {
        const yml = await DockerComposeBuilder.build(APP_NAME, {
          ...baseOptions,
          packageManager: 'npm',
          websockets: true,
          workers: true,
          client: 'react',
        })

        for (const name of [...API_SERVICES, 'client']) {
          // Node turns certificate checks off only when this is '0'
          expect(service(yml, name)).toContain(
            "      NODE_TLS_REJECT_UNAUTHORIZED: '${NODE_TLS_REJECT_UNAUTHORIZED:-1}'\n",
          )
        }
        // npm accepts any certificate once strict-ssl is false, even when Node checks them
        expect(yml).not.toMatch(/strict.?ssl/i)
        expect(yml).not.toContain('NODE_TLS_REJECT_UNAUTHORIZED:-0')
      })
    })

    context('the database hosts', () => {
      it('points each api service at the db service for both its primary and its replica connection', async () => {
        // the api's development .env sets DB_HOST and REPLICA_DB_HOST to localhost, which inside
        // a container is the container itself, and compose's environment wins over the .env
        const yml = await DockerComposeBuilder.build(APP_NAME, {
          ...baseOptions,
          websockets: true,
          workers: true,
        })

        for (const name of API_SERVICES) {
          expect(service(yml, name)).toContain('      DB_HOST: db\n')
          expect(service(yml, name)).toContain('      REPLICA_DB_HOST: db\n')
        }
      })
    })
  })
})
