import * as fs from 'node:fs/promises'
import defaultDbCredentials from '../../helpers/defaultDbCredentials.js'
import frontEndPackageManager from '../../helpers/frontEndPackageManager.js'
import internalSrcPath from '../../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../../helpers/newPsychicApp.js'
import runCmdForPackageManager from '../../helpers/packageManager/runCmdForPackageManager.js'
import { replacePackageManagerInFileContents } from '../../helpers/replacePackageManagerInFile.js'

// The client's development port: the one its `vite.config.ts` and the api's `client`
// script use, and the one the app's development `CORS_HOSTS` and `CLIENT_APP_HOST` name.
const CLIENT_DEV_PORT = 3000

export default class DockerComposeBuilder {
  public static async build(appName: string, options: NewPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'additional', 'docker', 'psychic', 'docker-compose.yml'),
      )
    )
      .toString()
      // `install` is the package manager's own command, not a package.json script, so
      // it never goes through `{{PM}}`: `npm run install` and `bun run install` look for
      // an `install` script, and Bun then runs the system `install` binary.
      .replace(/<PACKAGE_MANAGER>/g, options.packageManager)
      // Postgres creates this database when its volume is first initialized. It is the
      // `DB_NAME` the app's `.env` names, which compose does not override.
      .replace(/<DEV_DB_NAME>/, defaultDbCredentials(appName, 'development').name)
      .replace(/<CLIENT_YAML>/, this.clientYaml(options))
      .replace(/<REDIS_YAML>/, this.redisYaml(options))
      .replace(/<WS_YAML>/, this.wsYaml(options))
      .replace(/<WORKER_YAML>/, this.workerYaml(options))
      .replace(/<VOLUMES_YAML>/, this.volumesYaml(options))
      .replace(/<NETWORKS_YAML>/, this.networksYaml(options))
      .replace(/<API_DEPENDS_ON_YAML>/g, this.apiDependsOnYaml(options))
      .replace(/<WS_DEPENDS_ON_YAML>/g, this.wsDependsOnYaml(options))
      .replace(/<WORKER_DEPENDS_ON_YAML>/g, this.workerDependsOnYaml(options))
      .replace(/<CONTEXT_VALUE>/g, options.client === 'none' ? '.' : './api')
      .replace(/\n{2,}/g, '\n\n')

    return replacePackageManagerInFileContents(contents, options.packageManager)
  }

  private static workerDependsOnYaml(options: NewPsychicAppCliOptions) {
    return this.wsDependsOnYaml(options)
  }

  private static wsDependsOnYaml(options: NewPsychicAppCliOptions) {
    return `\
    networks:
      - backend<FRONTEND_NETWORK>
    depends_on:
      db:
        condition: service_healthy
      api:
        condition: service_healthy<REDIS_DEPENDS_ON>\
`
      .replace(/<FRONTEND_NETWORK>/, options.client !== 'none' ? '\n      - frontend' : '')
      .replace(
        /<REDIS_DEPENDS_ON>/,
        options.workers || options.websockets
          ? `
      redis:
        condition: service_healthy`
          : '',
      )
  }

  private static apiDependsOnYaml(options: NewPsychicAppCliOptions) {
    return `\
    networks:
      - backend<FRONTEND_NETWORK>
    depends_on:
      db:
        condition: service_healthy<REDIS_DEPENDS_ON>\
`
      .replace(/<FRONTEND_NETWORK>/, options.client !== 'none' ? '\n      - frontend' : '')
      .replace(
        /<REDIS_DEPENDS_ON>/,
        options.workers || options.websockets
          ? `
      redis:
        condition: service_healthy`
          : '',
      )
  }

  private static volumesYaml(options: NewPsychicAppCliOptions) {
    return `\
volumes:
  db:<REDIS><CLIENT_NODE_MODULES>\
`
      .replace(/<REDIS>/, options.websockets || options.workers ? '\n  redis:' : '')
      .replace(/<CLIENT_NODE_MODULES>/, options.client !== 'none' ? '\n  client_node_modules:' : '')
  }

  private static networksYaml(options: NewPsychicAppCliOptions) {
    return `\
networks:
  backend:<FRONT_END_YAML>\
`.replace(/<FRONT_END_YAML>/, options.client === 'none' ? '' : '\n  frontend:')
  }

  private static redisYaml(options: NewPsychicAppCliOptions) {
    if (!options.workers && !options.websockets) return ''

    return `\
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --save 20 1 --loglevel warning
    ports:
      - '6380:6379'
    volumes:
      - redis:/data
    networks:
      - backend
    healthcheck:
      test: ['CMD-SHELL', 'redis-cli ping | grep PONG']
      interval: 1s
      timeout: 3s
      retries: 5
`
  }

  private static clientYaml(options: NewPsychicAppCliOptions) {
    if (options.client === 'none') return ''

    return `\
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
      target: 'dev'
    user: '0'
    command: sh -c "${this.clientCommand(options)}"
    environment:
      NODE_ENV: '\${NODE_ENV:-development}'
      NODE_TLS_REJECT_UNAUTHORIZED: '\${NODE_TLS_REJECT_UNAUTHORIZED:-0}'
      NPM_CONFIG_STRICT_SSL: 'false'
    ports:
      - '${CLIENT_DEV_PORT}:${CLIENT_DEV_PORT}'
    working_dir: /usr/src/app
    volumes:
      - ./client:/usr/src/app:cached
      # Isolate container node_modules so Linux arm64-musl native deps (e.g. rollup) are used, not host's
      - client_node_modules:/usr/src/app/node_modules
    networks:
      - frontend
    depends_on:
      - api
`
  }

  // The client is its own package, driven by the front-end package manager (pnpm for a
  // Deno API), and each client scaffold (Vite, Next.js, Nuxt) names its dev server script
  // `dev`; `web:dev` is the api's. In a container the dev server must listen on every
  // interface for the published port to reach it, and Vite and Nuxt listen only on
  // localhost unless told otherwise.
  private static clientCommand(options: NewPsychicAppCliOptions) {
    const fePm = frontEndPackageManager(options)
    const hostFlag = options.client === 'nextjs' ? '--hostname' : '--host'
    // npm passes arguments on to a script only after `--`
    const forward = fePm === 'npm' ? '-- ' : ''

    return `${fePm} install && ${runCmdForPackageManager(fePm)} dev ${forward}${hostFlag} 0.0.0.0 --port ${CLIENT_DEV_PORT}`
  }

  private static wsYaml(options: NewPsychicAppCliOptions) {
    if (!options.websockets) return ''

    return `\
  ws:
    build:
      context: <CONTEXT_VALUE>
      dockerfile: Dockerfile.dev
      target: 'dev'
    command: sh -c "{{PM}} ws:dev"
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: '\${NODE_TLS_REJECT_UNAUTHORIZED:-0}'
      NPM_CONFIG_STRICT_SSL: 'false'
      DB_HOST: db
      WS_REDIS_HOST: redis
      BG_JOBS_REDIS_HOST: redis
      NODE_ENV: '\${NODE_ENV:-development}'
      DB_USER: postgres
      DB_PASSWORD: postgres
    ports:
      - '8888:8888'
    working_dir: /usr/src/app
    volumes:
      - <CONTEXT_VALUE>:/usr/src/app:cached
<WS_DEPENDS_ON_YAML>
`
  }

  private static workerYaml(options: NewPsychicAppCliOptions) {
    if (!options.workers) return ''
    return `\
  worker:
    build:
      context: <CONTEXT_VALUE>
      dockerfile: Dockerfile.dev
      target: 'dev'
    command: sh -c "{{PM}} worker:dev"
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: '\${NODE_TLS_REJECT_UNAUTHORIZED:-0}'
      NPM_CONFIG_STRICT_SSL: 'false'
      GITHUB_OAUTH_TOKEN: '\${GITHUB_OAUTH_TOKEN}'
      BULLMQ_PRO_NPM_TOKEN: '\${BULLMQ_PRO_NPM_TOKEN}'
      DB_HOST: db
      WS_REDIS_HOST: redis
      BG_JOBS_REDIS_HOST: redis
      NODE_ENV: '\${NODE_ENV:-development}'
      DB_USER: postgres
      DB_PASSWORD: postgres
    working_dir: /usr/src/app
    volumes:
      - <CONTEXT_VALUE>:/usr/src/app:cached
<WORKER_DEPENDS_ON_YAML>
`
  }
}
