import * as fs from 'node:fs/promises'
import internalSrcPath from '../../helpers/internalSrcPath.js'
import { NewPsychicAppCliOptions } from '../../helpers/newPsychicApp.js'
import { replaceYarnAndNpxInFileContents } from '../../helpers/replaceYarnAndNpxInFile.js'

export default class DockerComposeBuilder {
  public static async build(options: NewPsychicAppCliOptions) {
    const contents = (
      await fs.readFile(
        internalSrcPath('..', 'boilerplate', 'additional', 'docker', 'psychic', 'docker-compose.yml'),
      )
    )
      .toString()
      .replace(/<CLIENT_YAML>/, this.clientYaml(options))
      .replace(/<REDIS_YAML>/, this.redisYaml(options))
      .replace(/<VOLUMES_YAML>/, this.volumesYaml(options))
      .replace(/<NETWORKS_YAML>/, this.networksYaml(options))
      .replace(/<API_DEPENDS_ON_YAML>/, this.apiDependsOnYaml(options))
      .replace(/<CONTEXT_VALUE>/g, options.client === 'none' ? '.' : './api')
      .replace(/\n\n\n/g, '\n\n')

    return replaceYarnAndNpxInFileContents(contents, options.packageManager)
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
    image: redis:6.2-alpine
    restart: always
    command: redis-server --save 20 1 --loglevel warning
    ports:
      - "6380:6379"
    volumes:
      - redis:/data
    networks:
      - backend
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      interval: 1s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: "2"
`
  }

  private static clientYaml(options: NewPsychicAppCliOptions) {
    if (options.client === 'none') return ''

    return `\
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
      target: "dev"
    user: "0"
    command: sh -c "yarn install && yarn dev"
    environment:
      CI: "true"
      NODE_ENV: "\${NODE_ENV:-development}"
      NODE_TLS_REJECT_UNAUTHORIZED: "\${NODE_TLS_REJECT_UNAUTHORIZED:-0}"
      NPM_CONFIG_STRICT_SSL: "false"
    ports:
      - "3000:3000"
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
}
