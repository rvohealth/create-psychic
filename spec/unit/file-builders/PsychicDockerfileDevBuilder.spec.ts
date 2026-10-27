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

const NODE_DOCKERFILE =
  'ARG NODE_IMAGE=node:24.12.0-alpine\n\nFROM $NODE_IMAGE AS dev\nRUN corepack enable\nUSER node'

describe('PsychicDockerDevBuilder', () => {
  describe('.build', () => {
    context('a Bun app', () => {
      it("starts from Bun's image, named by a build ARG, and runs as the image's bun user", async () => {
        const dockerfile = await PsychicDockerDevBuilder.build({
          ...baseOptions,
          runtime: 'bun',
          packageManager: 'bun',
        })

        expect(dockerfile).toEqual(
          'ARG BUN_IMAGE=oven/bun:1.4.4-alpine\n\nFROM $BUN_IMAGE AS dev\nUSER bun\n',
        )
        expect(dockerfile).not.toContain('corepack')
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
    })
  })
})
