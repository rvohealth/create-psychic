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

const NODE_IMAGE_COMMENT =
  '# Node 24, since the Node 25 and later images ship no corepack for `corepack enable`, and\n' +
  '# 24.14.1 or later, whose npm (11.10+) applies the `min-release-age` cooldown in .npmrc\n'

const NODE_DOCKERFILE =
  NODE_IMAGE_COMMENT +
  'ARG NODE_IMAGE=node:24.22.1-alpine\n\nFROM $NODE_IMAGE AS dev\nRUN corepack enable\n' +
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

      it("starts from a Node 24 image whose npm applies the npm app's release-age cooldown", async () => {
        const dockerfile = await PsychicDockerDevBuilder.build({ ...baseOptions, packageManager: 'npm' })
        const version = /^ARG NODE_IMAGE=node:(\d+\.\d+\.\d+)-alpine$/m.exec(dockerfile)?.[1]
        expect(version).toBeDefined()
        const [major = 0, minor = 0, patch = 0] = (version ?? '').split('.').map(Number)

        // the Node 25 and later images ship no corepack, which `RUN corepack enable` needs
        expect(major).toEqual(24)
        // per nodejs.org/dist/index.json, Node 24 before 24.14.1 bundles an npm before 11.10
        // (24.12.0 bundles 11.6.2), which ignores .npmrc's `min-release-age` with only a
        // warning, so the image's npm installs releases minutes old; minor * 1000 + patch
        // orders 24.x.y releases
        expect(minor * 1000 + patch).toBeGreaterThanOrEqual(14 * 1000 + 1)
      })

      it('creates node_modules owned by the node user before switching to it', async () => {
        expect(await PsychicDockerDevBuilder.build(baseOptions)).toMatch(
          /\nRUN mkdir -p \/usr\/src\/app\/node_modules && chown node:node \/usr\/src\/app\/node_modules\nUSER node$/,
        )
      })
    })
  })
})
