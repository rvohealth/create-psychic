import PsychicDockerDevBuilder from '../../../src/file-builders/docker/PsychicDockerfileDevBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

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

const NODE_MODULES_COMMENT =
  '# docker-compose.yml mounts a volume over node_modules, which Docker creates with this\n' +
  "# directory's owner, so the image's user can install into it\n"

const NODE_DOCKERFILE =
  'ARG NODE_IMAGE=node:24.12.0-alpine\n\nFROM $NODE_IMAGE AS dev\nRUN corepack enable\n' +
  NODE_MODULES_COMMENT +
  'RUN mkdir -p /usr/src/app/node_modules && chown node:node /usr/src/app/node_modules\nUSER node'

const BUN_DOCKERFILE =
  'ARG BUN_IMAGE=oven/bun:1.4.4-alpine\n\nFROM $BUN_IMAGE AS dev\n' +
  NODE_MODULES_COMMENT +
  'RUN mkdir -p /usr/src/app/node_modules && chown bun:bun /usr/src/app/node_modules\nUSER bun\n'

describe('PsychicDockerDevBuilder', () => {
  describe('.build', () => {
    context('a Bun app', () => {
      it("starts from Bun's image, named by a build ARG, and runs as the image's bun user", async () => {
        const dockerfile = await PsychicDockerDevBuilder.build({
          ...baseOptions,
          runtime: 'bun',
          packageManager: 'bun',
        })

        expect(dockerfile).toEqual(BUN_DOCKERFILE)
        expect(dockerfile).not.toContain('corepack')
      })

      it('creates node_modules owned by the bun user before switching to it', async () => {
        const dockerfile = await PsychicDockerDevBuilder.build({
          ...baseOptions,
          runtime: 'bun',
          packageManager: 'bun',
        })

        expect(dockerfile).toContain(
          'RUN mkdir -p /usr/src/app/node_modules && chown bun:bun /usr/src/app/node_modules\nUSER bun\n',
        )
      })
    })

    context('a Node app', () => {
      it.each(['npm', 'pnpm', 'yarn'] as const)(
        'starts from the Node image, enables corepack and runs as node for %s',
        async packageManager => {
          expect(await PsychicDockerDevBuilder.build({ ...baseOptions, packageManager })).toEqual(
            NODE_DOCKERFILE,
          )
        },
      )

      it('creates node_modules owned by the node user before switching to it', async () => {
        expect(await PsychicDockerDevBuilder.build(baseOptions)).toMatch(
          /\nRUN mkdir -p \/usr\/src\/app\/node_modules && chown node:node \/usr\/src\/app\/node_modules\nUSER node$/,
        )
      })
    })
  })
})
