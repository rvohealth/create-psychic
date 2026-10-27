import ClientDockerDevBuilder from '../../../src/file-builders/docker/ClientDockerfileDevBuilder.js'
import { NewPsychicAppCliOptions } from '../../../src/helpers/newPsychicApp.js'

const baseOptions: NewPsychicAppCliOptions = {
  packageManager: 'pnpm',
  workers: false,
  websockets: false,
  claudePsychicSkill: false,
  agentsPsychicSkill: false,
  client: 'react',
  adminClient: 'none',
  internalClient: 'none',
  primaryKeyType: 'bigint',
}

const NODE_DOCKERFILE =
  'ARG NODE_IMAGE=node:24.12.0-alpine\n\nFROM $NODE_IMAGE AS dev\nRUN corepack enable\nUSER node'

describe('ClientDockerDevBuilder', () => {
  describe('.build', () => {
    it("gives a Bun app's client Bun's image, since Bun drives the client", async () => {
      const dockerfile = await ClientDockerDevBuilder.build({
        ...baseOptions,
        runtime: 'bun',
        packageManager: 'bun',
      })

      expect(dockerfile).toEqual('ARG BUN_IMAGE=oven/bun:1.4.4-alpine\n\nFROM $BUN_IMAGE AS dev\nUSER bun\n')
    })

    it.each(['npm', 'pnpm', 'yarn'] as const)(
      "gives a Node app's client the Node image with corepack for %s",
      async packageManager => {
        expect(await ClientDockerDevBuilder.build({ ...baseOptions, packageManager })).toEqual(
          NODE_DOCKERFILE,
        )
      },
    )

    it("gives a Deno app's client the Node image, since pnpm drives it", async () => {
      expect(
        await ClientDockerDevBuilder.build({ ...baseOptions, runtime: 'deno', packageManager: 'deno' }),
      ).toEqual(NODE_DOCKERFILE)
    })
  })
})
